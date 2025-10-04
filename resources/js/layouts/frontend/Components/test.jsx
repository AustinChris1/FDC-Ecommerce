                {/* --- Section: Explore Our Top Categories (Now positioned at the bottom of the sections, before the main product grid) --- */}
                <motion.div
                    ref={categoriesRef}
                    className="text-center mb-12 md:mb-16"
                    variants={sectionTitleVariants}
                    initial="hidden"
                    animate={categoriesInView ? "visible" : "hidden"}
                >
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
                        Explore Our <span className="dark:text-cyan-400 text-cyan-700">Top Categories</span>
                    </h2>
                    <p className="text-lg md:text-xl dark:text-gray-300 text-gray-700 max-w-2xl mx-auto">
                        Find the perfect tech for your needs from our expertly curated selections.
                    </p>
                </motion.div>

                {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin dark:text-cyan-400 text-cyan-700 mb-4" />
            <p className="text-xl dark:text-gray-400 text-gray-600">Loading categories...</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 mb-20 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-4">
            {categories.filter(cat => cat.id !== "All").map((category, i) => (
              <motion.div
                key={category.id}
                className="flex-none w-48 aspect-square dark:bg-gray-800 bg-gray-100 rounded-xl overflow-hidden shadow-2xl group relative cursor-pointer transform hover:scale-105 transition-transform duration-300 ease-out border border-transparent dark:hover:border-blue-600 hover:border-blue-400 flex flex-col justify-end"
                variants={sectionTitleVariants}
                initial="hidden"
                animate={categoriesInView ? "visible" : "hidden"}
                custom={i}
              >
                <Link to={`/collections/${category.link || 'default-category'}`} className="block h-full w-full relative">
                  <img
                    src={category.image || `https://placehold.co/180x180/e0e0e0/555555?text=${category.name}`}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-black/70 from-black/50 to-transparent"></div>
                  <div className="p-4 text-left absolute bottom-0 left-0 right-0">
                    <h3 className="text-lg font-bold dark:text-white text-gray-900 dark:group-hover:text-cyan-400 group-hover:text-cyan-700 transition-colors duration-300 line-clamp-1">
                      {category.name}
                    </h3>
                    <div className="inline-flex items-center dark:text-blue-400 text-blue-700 dark:hover:text-blue-200 hover:text-blue-500 transition-colors duration-300 font-semibold text-sm mt-1">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br dark:from-blue-500/10 from-blue-200/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        <hr className="my-16 dark:border-gray-800 border-gray-200" />

        {/* --- Section: Main Product Listing with Filtering and Pagination --- */}
        <div id="product-grid-section" className="mt-20">
          <motion.div
            className="text-center mb-12 md:mb-16"
            variants={sectionTitleVariants}
            initial="hidden"
            animate={allProductsInView ? "visible" : "hidden"}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg leading-tight">
              All Our <span className="dark:text-lime-400 text-lime-700">Products</span>
            </h2>
            <p className="text-lg md:text-xl dark:text-gray-300 text-gray-700 max-w-2xl mx-auto">
              Browse our extensive catalog of cutting-edge technology.
            </p>
          </motion.div>

          {/* Category Filter Tabs (Horizontally Scrollable) */}
          <motion.div
            className="flex flex-nowrap items-center justify-center overflow-x-auto gap-3 mb-12 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pb-4"
            initial="hidden"
            animate={allProductsInView ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
            }}
          >
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                className={`flex-none px-5 py-2 text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md
                ${selectedCategory === cat.id
                    ? 'dark:bg-blue-600 dark:text-white dark:shadow-blue-500/50 bg-blue-500 text-white shadow-blue-300/50'
                    : 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              >
                {cat.name}
              </motion.button>
            ))}
          </motion.div>

          {currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {currentProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  handleAddToCart={handleAddToCart}
                  inView={allProductsInView}
                  customDelay={i * 0.08}
                  isFlashSale={product.is_flash_sale}
                  flashSalePrice={product.flash_sale_price}
                  flashSaleEndsAt={product.flash_sale_ends_at}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl dark:text-gray-400 text-gray-600">No products found for this category.</p>
            </div>
          )}

          {/* Pagination Controls with Prev/Next buttons */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2 items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-full font-bold transition-all duration-300
                    ${pageNumber === currentPage
                      ? 'dark:bg-blue-600 dark:text-white bg-blue-500 text-white shadow-lg'
                      : 'dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>            </div>
