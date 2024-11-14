import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types/types';
import Search from '../components/search';

interface ProductGridProps {
  products: Product[];
  selectedCategories: Set<number>;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, selectedCategories }) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic based on categories and search query
  useEffect(() => {
    let updatedProducts = products;

    if (selectedCategories.size > 0) {
      updatedProducts = updatedProducts.filter((product) =>
        product.categories.some((category) => selectedCategories.has(category.id))
      );
    }

    if (searchQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  }, [selectedCategories, searchQuery, products]);

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto">
      {/* Pass the handleSearch function to the Search component */}
      <div className="flex justify-start mb-4">
        <Search onSearch={handleSearch} />
      </div>
      <h2 className="text-3xl font-bold mb-6">Our Product</h2>
      <div className="grid grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <div className="border p-4 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300">
                {product.images && product.images.length > 0 && (
                  <Image
                    src={product.images[0].image}
                    alt={product.name}
                    width={300}
                    height={400}
                    unoptimized={true}
                  />
                )}
                <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
                <p className="text-red-600 font-bold">
                  Rp.{product.prices && product.prices.length > 0 ? product.prices[0].price.toFixed(2) : 'N/A'}
                </p>
                <span className="block bg-blue-500 text-white py-2 mt-4 text-center rounded">View Details</span>
              </div>
            </Link>
          ))
        ) : (
          <p>No products available for the choice.</p>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
