import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/header/navbar';
import Footer from '../components/footer';
import { getImageUrl } from '../utils/getBaseURL';


// === Custom sort untuk part number (letakkan sebelum komponen/component apapun) ===
function extractCodeAndNumber(name: string) {
  // Cari kode part setelah dash, atau di seluruh string jika tidak ada dash
  // Contoh match: "AH300", "WDH300", "WSD150", dll.
  // Ambil yang pertama ditemukan saja
  const match = name.match(/([A-Z]+)(\d+)/i);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      number: parseInt(match[2], 10)
    };
  }
  return { prefix: name.toUpperCase(), number: Infinity }; // Untuk produk tanpa angka
}


function comparePartNumber(a: { Name: string; }, b: { Name: string; }) {
  const pa = extractCodeAndNumber(a.Name);
  const pb = extractCodeAndNumber(b.Name);

  if (pa.prefix === pb.prefix) {
    return pa.number - pb.number;
  }
  return pa.prefix.localeCompare(pb.prefix);
}

// --- Simple Carousel Komponen ---
const ProductCarousel = ({
  products,
  itemsPerPage = 4,
}: {
  products: Product[];
  itemsPerPage?: number;
}) => {
  const [page, setPage] = useState(0);

  const maxPage = Math.max(0, Math.ceil(products.length / itemsPerPage) - 1);

  const pagedProducts = products.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );


  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {pagedProducts.map((product) => (
          <Link
            key={product.Id}
            href={`/product/${product.Id}`}
            className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition p-3 sm:p-4 relative"
          >

            <div className="font-semibold text-base text-gray-800 truncate">{product.Name}</div>
          </Link>
        ))}
      </div>
      {/* Carousel controls */}
      <div className="flex justify-center mt-4 gap-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={page === 0}
        >
          &#8592; Prev
        </button>
        <span className="py-2 px-3 rounded bg-gray-100 font-semibold">
          {page + 1} / {maxPage + 1}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          disabled={page === maxPage}
        >
          Next &#8594;
        </button>
      </div>
    </div>
  );
};

// --- Tipe Data ---
interface Product {
  Id: number;
  Name: string;
  ProductImages: string[];
}
interface ProductCategory {
  Id: number;
  Name: string;
  CategoryImage: string | null;
  Products: Product[];
  Children?: ProductCategory[];
}

// --- Komponen Utama Home ---
const Home = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<number>>(new Set());
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Filter & Search State
  const [categoryOptions, setCategoryOptions] = useState<{ Id: number, Name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Untuk mapping kategori flat (untuk filter)
  const flattenCategoriesForOptions = (categories: ProductCategory[], acc: { Id: number, Name: string }[] = [], prefix = '') => {
    categories.forEach(cat => {
      acc.push({ Id: cat.Id, Name: prefix ? `${prefix} > ${cat.Name}` : cat.Name });
      if (cat.Children?.length) flattenCategoriesForOptions(cat.Children, acc, `${prefix ? `${prefix} > ` : ''}${cat.Name}`);
    });
    return acc;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/dealer/dealer/product/list');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();

        // Flatten & Hierarchy building
        const flattenCategories = (categories: ProductCategory[]): ProductCategory[] => {
          return categories.reduce((acc: ProductCategory[], category) => {
            const { Children, ...rest } = category;
            acc.push(rest as ProductCategory);
            if (Children) {
              acc.push(...flattenCategories(Children));
            }
            return acc;
          }, []);
        };
        const allCategories = flattenCategories(data.data);
        const categoryMap = new Map<number, ProductCategory>();
        allCategories.forEach(category => {
          categoryMap.set(category.Id, {
            ...category,
            Children: [],
          });
        });
        data.data.forEach((rootCategory: ProductCategory) => {
          const buildHierarchy = (category: ProductCategory) => {
            if (category.Children) {
              category.Children.forEach(child => {
                const parent = categoryMap.get(category.Id);
                const childNode = categoryMap.get(child.Id);
                if (parent && childNode) {
                  parent.Children!.push(childNode);
                  buildHierarchy(child);
                }
              });
            }
          };
          buildHierarchy(rootCategory);
        });
        const rootCategories = data.data.map((root: ProductCategory) => categoryMap.get(root.Id)!);

        // Tambahkan gambar kategori
        const addCategoryImages = async (category: ProductCategory): Promise<ProductCategory> => {
          try {
            const res = await fetch(
              `/api/admin/admin/products/productcategories/images/${category.Id}`
            );
            const imgData = await res.json();
            const imageUrl =
              imgData && imgData.data && Array.isArray(imgData.data) &&
                imgData.data.length > 0 && imgData.data[0].ImageUrl
                ? getImageUrl(imgData.data[0].ImageUrl)
                : null;

            const children = await Promise.all(
              category.Children?.map(addCategoryImages) || []
            );

            return {
              ...category,
              CategoryImage: imageUrl,
              Children: children,
            };
          } catch (err) {
            console.error('Error loading image:', err);
            return category;
          }
        };

        const processedCategories = await Promise.all(
          rootCategories.map(addCategoryImages)
        );

        // Urut produk dan anak-anak
        processedCategories.forEach(category => {
          if (category.Products) {
            category.Products.sort(comparePartNumber);
          }
          const sortChildren = (children?: ProductCategory[]) => {
            if (!children) return;
            children.forEach(child => {
              if (child.Products) {
                child.Products.sort(comparePartNumber); // <-- PENTING!
              }
              if (child.Children?.length) {
                sortChildren(child.Children);
              }
            });
          };
          sortChildren(category.Children);
        });

        setCategories(processedCategories);

        // Build filter options (dropdown)
        setCategoryOptions([
          { Id: 0, Name: 'All Categories' },
          ...flattenCategoriesForOptions(processedCategories),
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load product categories.');
      }
    };

    fetchCategories();
  }, []);

  // Recursive: ambil semua produk dalam kategori dan turunannya
  const collectAllProducts = (category: ProductCategory): Product[] => {
    let products: Product[] = [...(category.Products || [])];
    if (category.Children) {
      category.Children.forEach(child => {
        products = products.concat(collectAllProducts(child));
      });
    }
    return products;
  };

  // Filter berdasarkan kategori (dan search)
  const getFilteredProducts = () => {
    let filteredProducts: Product[] = [];
    if (selectedCategoryId === 'all' || selectedCategoryId === 0) {
      categories.forEach(cat => {
        filteredProducts = filteredProducts.concat(collectAllProducts(cat));
      });
    } else {
      // Hanya produk dari kategori terpilih + turunannya
      const findCategoryById = (cats: ProductCategory[]): ProductCategory | null => {
        for (const cat of cats) {
          if (cat.Id === selectedCategoryId) return cat;
          if (cat.Children) {
            const found = findCategoryById(cat.Children);
            if (found) return found;
          }
        }
        return null;
      };
      const selectedCat = findCategoryById(categories);
      if (selectedCat) {
        filteredProducts = collectAllProducts(selectedCat);
      }
    }
    // Search filter
    if (searchTerm.trim()) {
      filteredProducts = filteredProducts.filter(p =>
        p.Name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredProducts;
  };

  const filteredProducts = getFilteredProducts();

  // Recursive collapsible category
  function renderCategory(category: ProductCategory, level = 0) {
    const isOpen = openCategoryIds.has(category.Id);
    return (
      <div key={category.Id} className={`ml-${level * 4} mt-3`}>
        <button
          onClick={() =>
            setOpenCategoryIds(prev => {
              const newSet = new Set(prev);
              newSet.has(category.Id) ? newSet.delete(category.Id) : newSet.add(category.Id);
              return newSet;
            })
          }
          className="flex items-center justify-between w-full text-left font-semibold text-red-700 hover:text-red-900 transition-all"
        >
          <span>{category.Name}</span>
          {category.CategoryImage && (
            <img
              src={category.CategoryImage}
              alt={category.Name}
              className="h-10 w-10 ml-2 rounded-full object-contain shadow-lg border border-red-300"
              onClick={e => {
                e.stopPropagation();
                setZoomImageUrl(category.CategoryImage);
              }}
            />
          )}
        </button>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[999px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
        >
          {category.Products?.length > 0 && (
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              {category.Products.map(product => (
                <li key={product.Id}>
                  <Link href={`/product/${product.Id}`} className="hover:text-red-500 transition-colors">
                    {product.Name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {category.Children && category.Children.length > 0 && (
            <div className="mt-2 pl-4 border-l-2 border-red-300">
              {category.Children.map(child => renderCategory(child, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // === UI ===
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-2 md:px-0 bg-white min-h-screen pt-20">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Our Products</h1>
        <p className="text-gray-600 mb-8">
          Browse product categories below, or search for products directly.
        </p>
        {error && <p className="text-red-500 mb-6">{error}</p>}

        {/* --- HIRARKI KATEGORI --- */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map(category => (
              <div key={category.Id} className="bg-white rounded-lg shadow-md p-6">
                {renderCategory(category)}
              </div>
            ))}
          </div>
        </div>



        {/* --- CAROUSEL HASIL FILTER/SEARCH --- */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-700 mb-3">Product Results</h2>
          {/* --- FILTER DAN SEARCH BAR --- */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Kategori filter */}
            <div className="flex-1">
              <select
                className="w-full border rounded px-2 py-2 text-sm"
                value={selectedCategoryId}
                onChange={e =>
                  setSelectedCategoryId(e.target.value === '0' ? 'all' : parseInt(e.target.value))
                }
              >
                {categoryOptions.map(opt => (
                  <option key={opt.Id} value={opt.Id}>
                    {opt.Name}
                  </option>
                ))}
              </select>
            </div>
            {/* Search bar */}
            <div className="flex-1">
              <input
                type="text"
                className="w-full border rounded px-2 py-2 text-sm"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <ProductCarousel products={filteredProducts} itemsPerPage={12} />
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              No products found.
            </div>
          )}
        </div>

        {/* --- ZOOM IMAGE --- */}
        {zoomImageUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
            onClick={() => setZoomImageUrl(null)}
          >
            <img
              src={zoomImageUrl}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain rounded-lg cursor-zoom-out"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full px-3 py-1 text-sm hover:bg-opacity-75"
            >
              ✕ Close
            </button>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
};

export default Home;
