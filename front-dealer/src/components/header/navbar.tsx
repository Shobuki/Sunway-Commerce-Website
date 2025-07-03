'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CartPopup from './cartpopup';
import { ShoppingCart, User } from 'lucide-react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<{
    Image?: string;
    Name?: string;
  } | null>(null);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const token = sessionStorage.getItem('userToken');
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
    
      try {
        const sessionRes = await fetch('http://localhost:3000/api/dealer/dealer/auth', {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        if (!sessionRes.ok) {
          setIsLoggedIn(false);
          return;
        }
    
        const sessionData = await sessionRes.json();
    
        let userImage = null;
        const userId = sessionData.user?.Id;
    
        const pictureRes = await fetch('http://localhost:3000/api/dealer/dealer/profile/picture/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ UserId: userId }),
        });
        
    
        if (pictureRes.ok) {
          const pictureData = await pictureRes.json();
          userImage = pictureData.imageUrl ?? null;
        }
        console.log('User Image URL:', userImage);

        setIsLoggedIn(true);
        setUserData({
          Name: sessionData.user?.Username,
          Image: userImage,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
      }
    };
    

    checkAuthAndProfile();
    const handleStorageChange = () => {
      checkAuthAndProfile();
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  

  const handleLogout = () => {
    sessionStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setUserData(null);
    router.push('/login');
  };

  const ProfileDropdown = () => (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-10">
      <div className="p-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-700 truncate">{userData?.Name || 'User'}</p>
      </div>
      <div className="py-1">
        <Link
          href="/user/profile"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsProfileOpen(false)}
        >
          Profile Settings
        </Link>
        <Link
          href="/transaction/listtransaction"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          onClick={() => setIsProfileOpen(false)}
        >
          Transaction
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
        >
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <nav className="bg-white border-b shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link href="/home">
          <img
            src="/images/logo/sunway-logo.png"
            alt="Sunway Logo"
            className="h-10 w-auto hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex space-x-8 text-sm font-medium text-gray-600">
          <Link href="/our-services" className="hover:text-red-600 transition-colors">Our Services</Link>
          <Link href="/products" className="hover:text-red-600 transition-colors">Our Products</Link>
          <Link href="/brands" className="hover:text-red-600 transition-colors">Our Brands</Link>
          <Link href="/aboutus" className="hover:text-red-600 transition-colors">About Us</Link>
        </div>

        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <div
                className="relative group cursor-pointer text-gray-600 hover:text-red-600 transition-colors"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart size={22} />
                <div className={`absolute right-0 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} 
                  transition-all duration-200 mt-2`}>
                  <CartPopup isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {userData?.Image ? (
                    <img
                      src={userData.Image}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-sm hover:border-red-100 transition-colors"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      <User size={18} />
                    </div>
                  )}
                </button>
                {isProfileOpen && <ProfileDropdown />}
              </div>
            </>
          ) : isLoggedIn === false ? (
            <Link
              href="/login"
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-full 
              hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <User size={16} className="stroke-2" />
              <span>Login</span>
            </Link>
          ) : (
            <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
