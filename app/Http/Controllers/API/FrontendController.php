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
        // Eager load the 'category' relationship
        $products = Product::with('category') // <--- CRUCIAL CHANGE HERE
                            ->where('status', '0')
                            ->orderBy('created_at', 'desc')
                            ->get();

        $categories = Category::all(); // Still include if needed elsewhere

        return new JsonResponse([
            'status' => 200,
            'products' => $products,
            'categories' => $categories, // Optional, if you want to send categories too
        ]);
    }

    public function fetchProducts($category_link, $product_link): JsonResponse
    {
        // First, find the category to ensure it exists and is active
        $category = Category::where('link', $category_link)->where('status', '0')->first();

        if (!$category) {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found or inactive.',
            ], 404);
        }

        // Now, find the product within that category
        // Eager load the 'category' relationship, 'reviews' for average rating and count
        $product = Product::where('category_id', $category->id)
                          ->where('link', $product_link)
                          ->where('status', '0') // Ensure product is active
                          ->with('category') // Eager load the product's category
                          ->withAvg('reviews', 'rating') // Calculate average rating from reviews
                          ->withCount('reviews') // Count the number of reviews
                          ->first();

        if (!$product) {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found in this category or is inactive.',
            ], 404);
        }

        // Return the product (which now includes its category, average rating, and review count)
        // and the category object separately for consistency with previous API responses if needed.
        return response()->json([
            'status' => 200,
            'product' => $product,
            'category' => $category, // This is the category object found earlier
        ]);
    }

// Fetch products based on filters
    public function products(Request $request): JsonResponse
    {
        // --- Start Debugging Log ---
        Log::info('ProductController@products: Incoming request params:', $request->all());
        // --- End Debugging Log ---

        // Start with a query to get only active products and eager load the category
        // Also eager load reviews and calculate average rating and review count
        $query = Product::where('status', '0')
                        ->with('category')
                        ->withAvg('reviews', 'rating') // Assumes 'reviews' relationship exists on Product model
                        ->withCount('reviews'); // Assumes 'reviews' relationship exists on Product model

        $categories = Category::all(); // Fetch all categories for filter options

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
                // You might choose to return an an error or ignore the filter in this case
                // For now, we'll proceed but log the warning.
            } else {
                $query->whereBetween('selling_price', [$minPrice, $maxPrice]);
                Log::info("Applying price filter: min={$minPrice}, max={$maxPrice}");
            }
        }

        // Sorting products
        $sortOption = $request->input('sort', 'created_at_desc'); // Default to 'newest' or 'dateDesc'
        Log::info("Sorting by: {$sortOption}");

        switch ($sortOption) {
            case 'popular':
                // Sort by 'popular' flag (1 for popular, 0 for not), then by creation date
                $query->orderBy('popular', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'featured':
                // Sort by 'featured' flag (1 for featured, 0 for not), then by creation date
                $query->orderBy('featured', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'alphaAsc':
                $query->orderBy('name', 'asc');
                break;
            case 'alphaDesc':
                $query->orderBy('name', 'desc');
                break;
            case 'priceAsc':
                // Cast to DECIMAL for correct numeric sorting
                $query->orderBy(DB::raw('CAST(selling_price AS DECIMAL(10, 2))'), 'asc');
                break;
            case 'priceDesc':
                // Cast to DECIMAL for correct numeric sorting
                $query->orderBy(DB::raw('CAST(selling_price AS DECIMAL(10, 2))'), 'desc');
                break;
            case 'ratingDesc':
                // Sort by average rating in descending order
                $query->orderBy('reviews_avg_rating', 'desc')->orderBy('created_at', 'desc');
                break;
            case 'dateAsc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'dateDesc':
            default: // Catches 'dateDesc' and any unknown sort options
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginate the results
        $perPage = $request->input('itemsPerPage', 12); // Default to 12 items per page for shop view
        $products = $query->paginate($perPage);

        // --- Final Debugging Log ---
        Log::info('ProductController@products: Final product count for page:', ['count' => $products->count(), 'total' => $products->total(), 'currentPage' => $products->currentPage(), 'lastPage' => $products->lastPage()]);
        // --- End Final Debugging Log ---

        return new JsonResponse([ // Explicitly use new JsonResponse
            'status' => 200,
            'products' => $products,
            'categories' => $categories // Using 'categories' for consistency in return
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

        // Eager load the 'category' relationship for search results too
        $products = Product::with('category') // <--- CRUCIAL CHANGE HERE
            ->where('status', '0') // Only active products
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
                'categories' => $products->pluck('category')->unique('id')->values() // Collect unique categories from results
            ]);
        }

        // If no products are found, return a 404 response
        return new JsonResponse([
            'status' => 404,
            'products' => [],
            'message' => 'No products found matching your search.'
        ]);
    }

}
