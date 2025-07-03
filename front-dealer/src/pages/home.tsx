import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/header/navbar'; // Import the Navbar

interface Product {
  Id: number;
  Name: string;
  ProductImages: string[];
}

interface ProductCategory {
  Id: number;
  Name: string;
  CategoryImage: string;
  Products: Product[];
}

const Home = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dealer/dealer/product/list');
        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();

        const categoriesWithImages = await Promise.all(data.data.map(async (cat: ProductCategory) => {
          const imgRes = await fetch(`http://localhost:3000/api/admin/admin/products/productcategories/images/${cat.Id}`);
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            return {
              ...cat,
              CategoryImage: imgData.data[0]?.ImageUrl
                ? `http://localhost:3000${imgData.data[0].ImageUrl}`
                : '',
            };
          }
          return cat;
        }));

        setCategories(categoriesWithImages);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load product categories');
      }
    };




    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: number) => {
    setOpenCategoryId(prevId => (prevId === categoryId ? null : categoryId));
  };

  return (
    <>
      <Navbar /> {/* Insert Navbar Here */}
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Our Products</h1>
        <p className="text-gray-700 mb-8">
          This is our very own online catalog, made for your own convenience. Go ahead and browse through our large array of products, all with detailed types and measurements. Click on the product of your choice.
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="grid grid-cols-2 gap-8">
          {categories.map((category) => (
            <div className="relative p-6 bg-gray-50 rounded-lg shadow-md overflow-visible">
              <button
                onClick={() => toggleCategory(category.Id)}
                className="text-red-600 font-semibold flex items-center w-full"
              >
                {category.Name}
                <img
                  src={category.CategoryImage}
                  alt={category.Name}
                  className={`absolute top-2 right-2 object-contain rounded-full shadow pointer-events-none transition-all duration-300 ease-in-out ${openCategoryId === category.Id ? 'h-20 w-20' : 'h-12 w-12'
                    }`}
                />


                <span className={`ml-2 transition-transform ${openCategoryId === category.Id ? 'rotate-180' : 'rotate-0'}`}>
                  ▼
                </span>
              </button>

              {openCategoryId === category.Id && (
                <ul className="list-disc pl-6">
                  {category.Products.map((product) => (
                    <Link href={`/product/${product.Id}`} key={product.Id}>
                      <li className="text-gray-700 hover:text-red-600 cursor-pointer">
                        {product.Name}
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          ))}

        </div>
      </div>
    </>
  );
};

export default Home;
