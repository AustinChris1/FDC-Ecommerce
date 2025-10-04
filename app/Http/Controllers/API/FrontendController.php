<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class FrontendController extends Controller
{
    // Fetch active categories
    public function category()
    {
        $categories = Category::where('status', '0')->get();
        return response()->json([
            'status' => 200,
            'category' => $categories
        ]);
    }
    public function allProducts(): JsonResponse
    {
        $products = Product::with('category')
            ->where('status', '0')
            ->orderBy('created_at', 'desc')
            ->get();

        $categories = Category::all();

        return new JsonResponse([
            'status' => 200,
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function fetchProducts($category_link, $product_link): JsonResponse
    {
        $category = Category::where('link', $category_link)->where('status', '0')->first();

        if (!$category) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found or inactive.',
            ], 404);
        }

        $product = Product::where('category_id', $category->id)
            ->where('link', $product_link)
            ->where('status', '0')
            ->with('category')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->first();

        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found in this category or is inactive.',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'product' => $product,
            'category' => $category,
        ]);
    }

    // Fetch products based on filters
    public function products(Request $request): JsonResponse
    {
        Log::info('ProductController@products: Incoming request params:', $request->all());
        $query = Product::where('status', '0')
            ->with('category')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');

        $categories = Category::all();

        // Filter by category if provided
        if ($request->has('category') && $request->input('category') !== 'All') {
            $categoryName = $request->input('category');
            $query->whereHas('category', function ($q) use ($categoryName) {
                $q->where('name', $categoryName);
            });
            Log::info("Filtering by category: {$categoryName}");
        }

        // Filter by brand if provided
        if ($request->has('brand')) {
            $brand = $request->input('brand');
            $query->where('brand', $brand);
            Log::info("Filtering by brand: {$brand}");
        }

        // Filter by price range
        if ($request->has('min_price') && $request->has('max_price')) {
            $minPrice = (float) $request->input('min_price');
            $maxPrice = (float) $request->input('max_price');

            if (!is_numeric($minPrice) || !is_numeric($maxPrice) || $minPrice > $maxPrice) {
                Log::warning("Invalid price range provided: min={$minPrice}, max={$maxPrice}");
            } else {
                $query->whereBetween('selling_price', [$minPrice, $maxPrice]);
                Log::info("Applying price filter: min={$minPrice}, max={$maxPrice}");
            }
        }

        // Sorting products
        $sortOption = $request->input('sort', 'created_at_desc');
        Log::info("Sorting by: {$sortOption}");

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
                $query->orderBy(DB::raw('CAST(selling_price AS DECIMAL(10, 2))'), 'asc');
                break;
            case 'priceDesc':
                $query->orderBy(DB::raw('CAST(selling_price AS DECIMAL(10, 2))'), 'desc');
                break;
            case 'ratingDesc':

                $query->orderBy('reviews_avg_rating', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'dateAsc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'dateDesc':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginate the results
        $perPage = $request->input('itemsPerPage', 12);
        $products = $query->paginate($perPage);

        // --- Final Debugging Log ---
        Log::info('ProductController@products: Final product count for page:', ['count' => $products->count(), 'total' => $products->total(), 'currentPage' => $products->currentPage(), 'lastPage' => $products->lastPage()]);

        return new JsonResponse([
            'status' => 200,
            'products' => $products,
            'categories' => $categories
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

        $products = Product::with('category')
            ->where('status', '0')
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
        // Find the category by its link
        $category = Category::where('link', $categoryLink)->first();

        // Check if the category exists and is not hidden
        if (!$category || $category->status == 1) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found or is inactive',
            ], 404);
        }

        $products = Product::where('category_id', $category->id)
            ->where('status', 0)
            ->get();

        if ($products->isEmpty()) {
            return response()->json([
                'status' => 404,
                'message' => 'No products found in this category',
            ], 404);
        }

        return response()->json([
            'status' => 200,
            'products' => $products,
            'category' => $category,
        ]);
    }
}
