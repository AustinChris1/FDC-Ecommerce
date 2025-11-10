<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\JsonResponse;

class FrontendController extends Controller
{
    public function category()
    {
        // Cache categories for 1 hour
        $categories = Cache::remember('active_categories', 3600, function () {
            return Category::where('status', '0')->get();
        });

        return response()->json([
            'status' => 200,
            'category' => $categories
        ]);
    }

    public function allProducts(): JsonResponse
    {
        // Cache all products for 10 minutes
        $data = Cache::remember('all_products_with_reviews', 600, function () {
            $products = Product::with(['category', 'reviews'])
                ->where('status', '0')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->orderBy('created_at', 'desc')
                ->get();

            $categories = Category::all();

            return [
                'products' => $products,
                'categories' => $categories,
            ];
        });

        return new JsonResponse([
            'status' => 200,
            'products' => $data['products'],
            'categories' => $data['categories'],
        ]);
    }

    public function fetchProducts($category_link, $product_link): JsonResponse
    {
        // Cache individual product pages for 30 minutes
        $cacheKey = "product_{$category_link}_{$product_link}";
        
        $data = Cache::remember($cacheKey, 1800, function () use ($category_link, $product_link) {
            $category = Category::where('link', $category_link)
                ->where('status', '0')
                ->first();

            if (!$category) {
                return null;
            }

            $product = Product::where('category_id', $category->id)
                ->where('link', $product_link)
                ->where('status', '0')
                ->with(['category', 'reviews.user'])
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->first();

            if (!$product) {
                return null;
            }

            return [
                'product' => $product,
                'category' => $category,
            ];
        });

        if (!$data) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found in this category or is inactive.',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'product' => $data['product'],
            'category' => $data['category'],
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        Log::info('ProductController@products: Incoming request params:', $request->all());
        
        // Generate cache key based on request parameters
        $cacheKey = 'products_' . md5(json_encode($request->all()));
        
        // Cache filtered/sorted products for 5 minutes
        $data = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Product::where('status', '0')
                ->with('category')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews');

            $categories = Category::all();

            // Filter by category
            if ($request->has('category') && $request->input('category') !== 'All') {
                $categoryName = $request->input('category');
                $query->whereHas('category', function ($q) use ($categoryName) {
                    $q->where('name', $categoryName);
                });
            }

            // Filter by brand
            if ($request->has('brand')) {
                $brand = $request->input('brand');
                $query->where('brand', $brand);
            }

            // Filter by price range
            if ($request->has('min_price') && $request->has('max_price')) {
                $minPrice = (float) $request->input('min_price');
                $maxPrice = (float) $request->input('max_price');

                if (is_numeric($minPrice) && is_numeric($maxPrice) && $minPrice <= $maxPrice) {
                    $query->whereBetween('selling_price', [$minPrice, $maxPrice]);
                }
            }

            // Sorting
            $sortOption = $request->input('sort', 'dateDesc');

            switch ($sortOption) {
                case 'popular':
                    $query->orderBy('popular', 'desc')->orderBy('created_at', 'desc');
                    break;
                case 'featured':
                    $query->orderBy('featured', 'desc')->orderBy('created_at', 'desc');
                    break;
                case 'alphaAsc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'alphaDesc':
                    $query->orderBy('name', 'desc');
                    break;
                case 'priceAsc':
                    $query->orderByRaw('CAST(selling_price AS DECIMAL(10, 2)) ASC');
                    break;
                case 'priceDesc':
                    $query->orderByRaw('CAST(selling_price AS DECIMAL(10, 2)) DESC');
                    break;
                case 'ratingDesc':
                    $query->orderBy('reviews_avg_rating', 'desc')
                          ->orderBy('created_at', 'desc');
                    break;
                case 'dateAsc':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'dateDesc':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            $perPage = $request->input('itemsPerPage', 12);
            $products = $query->paginate($perPage);

            return [
                'products' => $products,
                'categories' => $categories
            ];
        });

        return new JsonResponse([
            'status' => 200,
            'products' => $data['products'],
            'categories' => $data['categories']
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->query('query');

        if (empty($searchTerm)) {
            return new JsonResponse([
                'status' => 400,
                'message' => 'Search query cannot be empty.'
            ], 400);
        }

        // Don't cache search results as they're user-specific
        $products = Product::with(['category', 'reviews'])
            ->where('status', '0')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where(function ($query) use ($searchTerm) {
                $query->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('brand', 'LIKE', "%{$searchTerm}%")
                    ->orWhereHas('category', function ($q) use ($searchTerm) {
                        $q->where('name', 'LIKE', "%{$searchTerm}%");
                    });
            })
            ->get();

        if ($products->isNotEmpty()) {
            return new JsonResponse([
                'status' => 200,
                'products' => $products,
                'categories' => $products->pluck('category')->unique('id')->values()
            ]);
        }

        return new JsonResponse([
            'status' => 404,
            'products' => [],
            'message' => 'No products found matching your search.'
        ]);
    }

    public function productsByCategory($categoryLink)
    {
        // Cache category products for 15 minutes
        $cacheKey = "category_products_{$categoryLink}";
        
        $data = Cache::remember($cacheKey, 900, function () use ($categoryLink) {
            $category = Category::where('link', $categoryLink)->first();

            if (!$category || $category->status == 1) {
                return null;
            }

            $products = Product::where('category_id', $category->id)
                ->where('status', 0)
                ->with('reviews')
                ->withAvg('reviews', 'rating')
                ->withCount('reviews')
                ->get();

            return [
                'category' => $category,
                'products' => $products,
            ];
        });

        if (!$data) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found or is inactive',
            ], 404);
        }

        if ($data['products']->isEmpty()) {
            return response()->json([
                'status' => 404,
                'message' => 'No products found in this category',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'products' => $data['products'],
            'category' => $data['category'],
        ]);
    }
}