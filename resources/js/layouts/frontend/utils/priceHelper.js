export const getEffectivePrice = (product) => {
    if (!product) return 0;
    
    // Check if flash sale is active
    if (product.is_flash_sale && product.flash_sale_price) {
        const now = new Date();
        const startDate = product.flash_sale_starts_at ? new Date(product.flash_sale_starts_at) : null;
        const endDate = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;

        // Validate flash sale is within date range
        const isWithinDateRange = 
            (!startDate || now >= startDate) && 
            (!endDate || now <= endDate);

        if (isWithinDateRange) {
            return Number(product.flash_sale_price);
        }
    }
    
    // Return regular selling price if no active flash sale
    return Number(product.selling_price) || 0;
};

export const isFlashSaleActive = (product) => {
    if (!product || !product.is_flash_sale || !product.flash_sale_price) {
        return false;
    }

    const now = new Date();
    const startDate = product.flash_sale_starts_at ? new Date(product.flash_sale_starts_at) : null;
    const endDate = product.flash_sale_ends_at ? new Date(product.flash_sale_ends_at) : null;

    return (!startDate || now >= startDate) && (!endDate || now <= endDate);
};

export const getDiscountPercentage = (product) => {
    // Add null check
    if (!product) return 0;
    
    const effectivePrice = getEffectivePrice(product);
    const originalPrice = Number(product.original_price) || effectivePrice;
    
    if (originalPrice <= effectivePrice) return 0;
    
    return Math.round(((originalPrice - effectivePrice) / originalPrice) * 100);
};

export const formatPrice = (price, currency = '₦') => {
    return `${currency}${Number(price).toLocaleString()}`;
};