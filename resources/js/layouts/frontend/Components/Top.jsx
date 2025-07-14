// homepage.jsx (or Top.jsx)
import React, { useState, useEffect, useMemo } from 'react';
import HeroSlider from './HeroSection'; // Assuming HeroSlider is in the same directory or correctly imported
import ProductCardBox from './ProductCardBox'; // Import the new ProductCardBox component
import axios from 'axios';
import { toast } from 'react-toastify';
import { useInView } from 'react-intersection-observer';
import { useCart } from './CartContext'; // Assuming CartContext is available
import Load from './Load';

const Top = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart(); // Assuming useCart is available

    const { ref: heroSectionRef, inView: heroSectionInView } = useInView({
        triggerOnce: true,
        threshold: 0.1, // Trigger when 10% of the component is in view
    });

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const productsRes = await axios.get(`/api/allProducts`);
                if (productsRes.data.status === 200) {
                    const productsFromApi = productsRes.data.products;

                    const productsWithReviewPromises = productsFromApi.map(async (product) => {
                        let averageRating = 0;
                        let reviewCount = 0;
                        try {
                            const reviewRes = await axios.get(`/api/products/${product.id}/reviews`);
                            if (reviewRes.data.status === 200 && Array.isArray(reviewRes.data.reviews)) {
                                reviewCount = reviewRes.data.reviews.length;
                                if (reviewCount > 0) {
                                    const totalRating = reviewRes.data.reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
                                    averageRating = (totalRating / reviewCount).toFixed(1);
                                }
                            }
                        } catch (reviewError) {
                            console.warn(`Could not fetch reviews for product ${product.name} (ID: ${product.id}):`, reviewError);
                        }

                        const flashSaleEndsAt = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;
                        const flashSaleStartsAt = product.flash_sale_starts_at ? new Date(product.flash_sale_starts_at) : null;
                        const now = new Date();

                        const isCurrentlyFlashSale = product.is_flash_sale && flashSaleStartsAt && flashSaleEndsAt &&
                            now >= flashSaleStartsAt && now <= flashSaleEndsAt;

                        // Calculate discount percentage for EACH product here
                        let discountPercentage = 0;
                        if (product.original_price && product.selling_price && parseFloat(product.original_price) > parseFloat(product.selling_price)) {
                            discountPercentage = ((parseFloat(product.original_price) - parseFloat(product.selling_price)) / parseFloat(product.original_price)) * 100;
                        }

                        return {
                            ...product,
                            rating: parseFloat(averageRating),
                            num_reviews: reviewCount,
                            is_new_arrival: product.is_new_arrival || false,
                            is_flash_sale: isCurrentlyFlashSale || false,
                            flash_sale_price: product.flash_sale_price,
                            flash_sale_starts_at: product.flash_sale_starts_at,
                            flash_sale_ends_at: product.flash_sale_ends_at,
                            original_price: product.original_price,
                            selling_price: product.selling_price,
                            discountPercentage: parseFloat(discountPercentage.toFixed(2)), // Add this property to each product
                            popular: product.popular || false, // Ensure 'popular' property exists
                            featured: product.featured || false // Ensure 'featured' property exists
                        };
                    });

                    const productsWithReviews = await Promise.all(productsWithReviewPromises);
                    setProducts(productsWithReviews);

                } else {
                    toast.error("Unable to fetch products.");
                    console.error("Backend error fetching products:", productsRes.data.message);
                }
            } catch (error) {
                console.error("Network or server error during data fetch:", error);
                toast.error("Failed to load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // REMOVED: The incorrect `discountPercentage` calculation outside the useEffect.
    // That variable was not scoped correctly for individual products.

    // Memoized product subsets for the boxes
    const everydayPricesProducts = useMemo(() =>
        products.filter(p => p.qty > 0).sort(() => 0.5 - Math.random()).slice(0, 4),
        [products]
    );

    const flashSaleProducts = useMemo(() =>
        products.filter(p => p.is_flash_sale && p.qty > 0).sort(() => 0.5 - Math.random()).slice(0, 4),
        [products]
    );

    const todaysBigDealsProducts = useMemo(() =>
        // Filter for products with a discount and sort by the highest discount percentage
        products
            .filter(p => p.discountPercentage > 0 && p.qty > 0) // Now correctly access p.discountPercentage
            .sort((a, b) => b.discountPercentage - a.discountPercentage) // Sort by the calculated discountPercentage
            .slice(0, 4), // Get the top 4 products with the biggest discounts
        [products]
    );

    const todaysPopularProducts = useMemo(() =>
        products.filter(p => p.popular && p.qty > 0).sort((a, b) => b.num_reviews - a.num_reviews).slice(0, 4),
        [products]
    );

    const topBrandsProducts = useMemo(() =>
        products.filter(p => p.featured && p.qty > 0).sort(() => 0.5 - Math.random()).slice(0, 4),
        [products]
    );


    // This is the main container for your homepage content
    return (
        <div className="relative w-full overflow-hidden bg-gray-950 mt-10 min-h-screen">
            {/* Hero Section - The Slider */}
            {/* Kept original height values as per your request not to change styling */}
            <div ref={heroSectionRef} className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] overflow-hidden">
                <HeroSlider products={products} handleAddToCart={addToCart} />
            </div>

            {/* Overlaying Product Showcase Boxes */}
            {/* Kept original margin-top values as per your request not to change styling */}
            <div className="relative z-40 px-4 md:px-8 -mt-40 md:-mt-60 lg:-mt-80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center h-[300px]">
                        <Load />
                    </div>
                ) : (<>
                    <ProductCardBox
                        title="Everyday Great Prices"
                        products={everydayPricesProducts}
                        linkHref="/shop"
                        inView={heroSectionInView}
                        customDelay={0.1}
                    />
                    <ProductCardBox
                        title="Flash Sale Products"
                        products={flashSaleProducts}
                        linkHref="/flash-sales"
                        inView={heroSectionInView}
                        customDelay={0.2}
                    />
                    <ProductCardBox
                        title="Popular Products Today"
                        products={todaysPopularProducts}
                        linkHref="/trending"
                        inView={heroSectionInView}
                        customDelay={0.3}
                    />
                    <ProductCardBox
                        title="Today's Big Deals"
                        products={todaysBigDealsProducts} // Now truly big deals by discount percentage
                        linkHref="/"
                        inView={heroSectionInView}
                        customDelay={0.4} // Adjusted delay for stagger effect
                    />
                    <ProductCardBox
                        title="Deals on Top Brands"
                        products={topBrandsProducts}
                        linkHref="/collections/top-brands"
                        inView={heroSectionInView}
                        customDelay={0.5}
                    />
                </>
                )}
            </div>
        </div>
    );
};

export default Top;