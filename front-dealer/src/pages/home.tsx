import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Navbar from '../components/header/navbar';
import Carousel from '../components/carousel';
import ProductGrid from '../components/productgrid';
import Sidebar from '../components/header/sidebar';
import { Product } from '../../types/types';
import Footer from '../components/footer';

const Home = ({ products }: { products: Product[] }) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());

  // Filter products based on selected categories
  const filteredProducts = selectedCategories.size > 0
    ? products.filter(product =>
        product.categories.some(category => selectedCategories.has(category.id))
      )
    : products;

  return (
    <>
      <Navbar />
      <Carousel />
      <div className="flex">
        {/* Sidebar now passes a Set<number> directly */}
        <Sidebar onCategoryChange={setSelectedCategories} />
        <div className="flex-1 p-6 bg-gray-100">
          <ProductGrid products={filteredProducts} selectedCategories={selectedCategories} />
        </div>
      </div>
      <Footer /> {/* Corrected placement of Footer */}
    </>
  );
};

// Fetch data from the API and ensure it matches the Product type
export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();

  // Format the products to ensure the image paths are web URLs
  const formattedProducts = products.map((product: any) => ({
    ...product,
    images: product.images.map((img: any) => ({
      id: img.id,
      image: img.image.replace('C:\\xampp\\htdocs\\sunway\\front\\public', ''),
    })),
  }));

  return {
    props: {
      products: formattedProducts,
    },
  };
};

export default Home;
