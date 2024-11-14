import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CartPopup from './cartpopup';
import Profile from './user/profile';

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null berarti status login belum diketahui
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('userToken');
    if (token) {
      fetch('/api/user/session', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.userId) {
            setIsLoggedIn(true);
            setUserId(data.userId);
          } else {
            setIsLoggedIn(false);
          }
        })
        .catch((error) => {
          console.error('Session check failed:', error);
          setIsLoggedIn(false);
        });
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleMouseEnter = () => setIsCartOpen(true);
  const handleMouseLeave = () => setIsCartOpen(false);

  const handleLogout = () => {
    sessionStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setUserId(null);
    window.location.reload(); // Reload page to update navbar after logout
  };

  return (
    <nav className="bg-white border-b shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="flex items-center space-x-4">
          <Link href="/home">
            <img src="/images/logo/sunway-logo.png" alt="Sunway Logo" width={150} height={50} />
          </Link>
          <div className="flex space-x-6" style={{ marginLeft: '80px' }}>
            <Link href="/aboutus">About us</Link>
            <Link href="/products">Products</Link>
            <Link href="/contact-us">Contact Us</Link>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div
            className="relative group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className="cursor-pointer">🛒</span>
            <div
              className={`absolute right-0 ${
                isCartOpen ? 'block' : 'hidden'
              } bg-white shadow-md rounded w-72 z-50`}
            >
              <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>
          </div>

          <div className="h-6 border-l border-gray-300"></div>

          {isLoggedIn === null ? (
            <div>Loading...</div> // Placeholder saat status login sedang di-fetch
          ) : isLoggedIn && userId ? (
            <Profile userId={userId} onLogout={handleLogout} />
          ) : (
            <>
              <Link href="/login">
                <button className="border border-red-600 text-red-600 py-1 px-4 rounded hover:bg-red-600 hover:text-white transition">
                  Masuk
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 transition">
                  Daftar
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
