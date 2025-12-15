import React, { useState, useEffect, useMemo } from 'react';
import HeroSlider from './HeroSection'; 
import ProductCardBox from './ProductCardBox';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useInView } from 'react-intersection-observer';
import { useCart } from './CartContext';
import Load from './Load';
import { isFlashSaleActive, getDiscountPercentage } from '../utils/priceHelper';

const Top = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [lastViewedCategoryLink, setLastViewedCategoryLink] = useState(null);
    const [lastViewedCategoryName, setLastViewedCategoryName] = useState('');
    const [similarProducts, setSimilarProducts] = useState([]);
    const [similarProductsLoading, setSimilarProductsLoading] = useState(false);

    const { ref: heroSectionRef, inView: heroSectionInView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const productsRes = await axios.get(`/api/allProducts`);
                
                if (productsRes.data.status === 200) {
                    const productsFromApi = productsRes.data.products;

                    const processedProducts = productsFromApi.map((product) => {
                        // Use the helper function to check flash sale status
                        const isCurrentlyFlashSale = isFlashSaleActive(product);
                        
                        // Calculate discount percentage using helper
                        const discountPercentage = getDiscountPercentage(product);

                        return {
                            ...product,
                            rating: parseFloat(product.reviews_avg_rating || 0),
                            num_reviews: product.reviews_count || 0,
                            is_new_arrival: product.is_new_arrival || false,
                            is_flash_sale: isCurrentlyFlashSale,
                            flash_sale_price: product.flash_sale_price,
                            flash_sale_starts_at: product.flash_sale_starts_at,
                            flash_sale_ends_at: product.flash_sale_ends_at,
                            original_price: product.original_price,
                            selling_price: product.selling_price,
                            discountPercentage: parseFloat(discountPercentage.toFixed(2)),
                            popular: product.popular || false,
                            featured: product.featured || false
                        };
                    });

                    console.log(`Processed ${processedProducts.filter(p => p.is_flash_sale).length} active flash sale products`);
                    setProducts(processedProducts);
                } else {
                    console.error("Backend error fetching products:", productsRes.data.message);
                }
            } catch (error) {
                console.error("Network or server error during data fetch:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const recentlyViewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        console.log("Recently viewed items from localStorage:", recentlyViewedItems);
        if (recentlyViewedItems.length > 0) {
            const lastViewedItem = recentlyViewedItems[0];
            if (lastViewedItem.category_link) {
                setLastViewedCategoryLink(lastViewedItem.category_link);
                const formattedName = lastViewedItem.category_link.replace(/-/g, ' ');
                setLastViewedCategoryName(formattedName);
            }
        }
    }, []);

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            if (lastViewedCategoryLink) {
                setSimilarProductsLoading(true);
                try {
                    const res = await axios.get(`/api/products-by-category/${lastViewedCategoryLink}`);
                    if (res.data.status === 200) {
                        const allSimilar = res.data.products;
                        const recentlyViewedItems = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
                        const lastViewedProductId = recentlyViewedItems.length > 0 
                            ? recentlyViewedItems[0].id 
                            : null;
                        
                        const filteredSimilar = allSimilar.filter(p => p.id !== lastViewedProductId);
                        const randomSimilar = filteredSimilar
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 4);
                        setSimilarProducts(randomSimilar);
                    }
                } catch (error) {
                    console.error("Failed to fetch similar products:", error);
                    setSimilarProducts([]);
                } finally {
                    setSimilarProductsLoading(false);
                }
            }
        };
        fetchSimilarProducts();
    }, [lastViewedCategoryLink]);

    const everydayPricesProducts = useMemo(() =>
        products.filter(p => p.qty > 0).sort(() => 0.5 - Math.random()).slice(0, 4),
        [products]
    );

    // Flash sale products - only show active ones
    const flashSaleProducts = useMemo(() =>
        products.filter(p => p.is_flash_sale && p.qty > 0)
            .sort((a, b) => new Date(a.flash_sale_ends_at) - new Date(b.flash_sale_ends_at))
            .slice(0, 4),
        [products]
    );

    const todaysBigDealsProducts = useMemo(() =>
        products
            .filter(p => p.discountPercentage > 0 && p.qty > 0)
            .sort((a, b) => b.discountPercentage - a.discountPercentage)
            .slice(0, 4),
        [products]
    );

    const todaysPopularProducts = useMemo(() =>
        products
            .filter(p => p.popular && p.qty > 0)
            .sort((a, b) => b.num_reviews - a.num_reviews)
            .slice(0, 4),
        [products]
    );

    const topBrandsProducts = useMemo(() =>
        products
            .filter(p => p.featured && p.qty > 0)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4),
        [products]
    );

    return (
        <div className="relative w-full overflow-hidden dark:bg-gray-950 bg-white mt-10 min-h-screen">
            <Helmet>
                <title>FirstSmart Mart</title>
                <meta name="description" content="Shop the latest products at FirstSmart Mart." />
            </Helmet>

            <div ref={heroSectionRef} className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] overflow-hidden">
                <HeroSlider products={products} handleAddToCart={addToCart} />
            </div>

            <div className="relative z-30 px-4 md:px-8 -mt-40 md:-mt-60 lg:-mt-80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                {loading ? (
                    <div className="col-span-full flex justify-center items-center h-[300px]">
                        <Load />
                    </div>
                ) : (
                    <>
                        {similarProducts.length > 0 && lastViewedCategoryName && (
                            <ProductCardBox
                                title={`Because you viewed ${lastViewedCategoryName}`}
                                products={similarProducts}
                                linkHref={`/collections/${lastViewedCategoryLink}`}
                                inView={heroSectionInView}
                                customDelay={0.0}
                            />
                        )}
                        {everydayPricesProducts.length > 0 && (
                            <ProductCardBox
                                title="Everyday Great Prices"
                                products={everydayPricesProducts}
                                linkHref="/shop"
                                inView={heroSectionInView}
                                customDelay={0.1}
                            />
                        )}
                        {flashSaleProducts.length > 0 && (
                            <ProductCardBox
                                title="Flash Sale Products"
                                products={flashSaleProducts}
                                linkHref="/flash-sales"
                                inView={heroSectionInView}
                                customDelay={0.2}
                            />
                        )}
                        {todaysPopularProducts.length > 0 && (
                            <ProductCardBox
                                title="Popular Products Today"
                                products={todaysPopularProducts}
                                linkHref="/trending"
                                inView={heroSectionInView}
                                customDelay={0.3}
                            />
                        )}
                        {todaysBigDealsProducts.length > 0 && (
                            <ProductCardBox
                                title="Today's Big Deals"
                                products={todaysBigDealsProducts}
                                linkHref="/"
                                inView={heroSectionInView}
                                customDelay={0.4}
                            />
                        )}
                        {topBrandsProducts.length > 0 && (
                            <ProductCardBox
                                title="Deals on Top Brands"
                                products={topBrandsProducts}
                                linkHref="/collections/top-brands"
                                inView={heroSectionInView}
                                customDelay={0.5}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Top;