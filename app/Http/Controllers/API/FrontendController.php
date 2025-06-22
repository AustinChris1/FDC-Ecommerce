<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
    public function allProducts()
    {
        $products = Product::where('status', '0')->orderBy('created_at', 'desc')->get();

        $categories = Category::all();

        return response()->json([
            'status' => 200,
            'products' => $products,
            'categories' => $categories, // Optional, if you want to send categories too
        ]);
    }

    public function fetchProducts($category_link, $product_link)
    {
        $category = Category::where('link', $category_link)->where('status', '0')->first();
        if ($category) {
            $product = Product::where('category_id', $category->id)->where('link', $product_link)->first();
            if ($product) {
                return response()->json([
                    'status' => 200,
                    'product' => $product,
                    'category' => $category,
                ]);
            } else {
                return response()->json([
                    'status' => 404,
                    'message' => 'Product not found',
                ]);
            }
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Category not found',
            ]);
        }
    }

// Fetch products based on filters
public function products(Request $request)
{
    // --- Start Debugging Log ---
    Log::info('ProductController@products: Incoming request params:', $request->all());
    // --- End Debugging Log ---

    // Start with a query to get only active products
    $query = Product::where('status', '0');
    $categories = Category::all();

    // Filter by category if provided
    if ($request->has('category') && $request->input('category') !== 'All') {
        $category = $request->input('category');
        $query->whereHas('category', function ($q) use ($category) {
            $q->where('name', $category);
        });
        Log::info("Filtering by category: {$category}");
    }

    // Filter by brand if provided
    if ($request->has('brand')) {
        $brand = $request->input('brand');
        $query->where('brand', $brand);
        Log::info("Filtering by brand: {$brand}");
    }

    // --- ADDED/CORRECTED: Filter by price range ---
    if ($request->has('min_price') && $request->has('max_price')) {
        $minPrice = (float) $request->input('min_price');
        $maxPrice = (float) $request->input('max_price');

        // Optional: Basic validation for price range
        if (!is_numeric($minPrice) || !is_numeric($maxPrice) || $minPrice > $maxPrice) {
             Log::warning("Invalid price range provided: min={$minPrice}, max={$maxPrice}");
             // You might choose to return an error or ignore the filter in this case
             // For now, we'll proceed but log the warning.
        } else {
            $query->whereBetween('selling_price', [$minPrice, $maxPrice]);
            Log::info("Applying price filter: min={$minPrice}, max={$maxPrice}");
        }
    }
    // --- END ADDED/CORRECTED: Filter by price range ---


    // Sorting products
    $sortOption = $request->input('sort', 'featured'); // Default to 'featured'
    Log::info("Sorting by: {$sortOption}");

    switch ($sortOption) {
        case 'popular':
            // Assuming 'popular' status is marked by a 'popular' column (boolean or integer)
            $query->where('popular', 1)->orderBy('created_at', 'desc');
            break;
        case 'alphaAsc':
            $query->orderBy('name', 'asc');
            break;
        case 'alphaDesc':
            $query->orderBy('name', 'desc');
            break;
        // --- ADDED/CORRECTED: Price Sorting Cases ---
        case 'priceAsc':
            $query->orderBy('selling_price', 'asc');
            break;
        case 'priceDesc':
            $query->orderBy('selling_price', 'desc');
            break;
        // --- END ADDED/CORRECTED: Price Sorting Cases ---
        case 'dateAsc':
            $query->orderBy('created_at', 'asc');
            break;
        case 'dateDesc':
            $query->orderBy('created_at', 'desc');
            break;
        case 'featured': // Explicitly handled for clarity, also covered by default
        default: // Catches 'featured' and any unknown sort options
            // Assuming 'featured' status is marked by a 'featured' column (boolean or integer)
            $query->where('featured', 1)->orderBy('created_at', 'desc');
            break;
    }

    // Paginate the results
    $perPage = $request->input('itemsPerPage', 4);
    $products = $query->paginate($perPage);

    // --- Final Debugging Log ---
    Log::info('ProductController@products: Final product count for page:', ['count' => $products->count(), 'total' => $products->total(), 'currentPage' => $products->currentPage(), 'lastPage' => $products->lastPage()]);
    // --- End Final Debugging Log ---

    return response()->json([
        'status' => 200,
        'products' => $products,
        'categories' => $categories // Using 'categories' for consistency in return
    ]);
}    
    public function search(Request $request)
    {
        $searchTerm = $request->query('query');
    
        if ($searchTerm) {
            // Search for products where the name or description contains the search term
            $products = Product::where('name', 'LIKE', "%{$searchTerm}%")
            ->orWhere('brand', 'LIKE', "%{$searchTerm}%")
            ->get();
    
            // Check if any products were found
            if ($products->isNotEmpty()) {
                // Retrieve categories for each product by mapping the product IDs to their category
                $categories = Category::whereIn('id', $products->pluck('category_id'))
                    ->where('status', '0')
                    ->get();
    
                return response()->json([
                    'status' => 200,
                    'products' => $products,
                    'categories' => $categories
                ]);
            }
    
            // If no products are found, return a 404 response
            return response()->json([
                'status' => 404,
                'products' => [],
                'message' => 'No products found'
            ]);
        }
    
        // If no search term was provided, return an empty result
        return response()->json([
            'status' => 404,
            'products' => [],
            'message' => 'No search term provided'
        ]);
    }
    
}
