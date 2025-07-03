import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface CartItem {
  Id: number;
  Quantity: number;
  ItemCode: {
    Id: number;
    Name: string;
    OEM: string;
    StockingTypeCode: string;
    SalesCode: string;
    Weight: number;
  };
}

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  // Pada CartPopup.tsx - Perbaikan di useEffect
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const userId = sessionStorage.getItem('userId');
    
        console.log("Session Storage:", {
          token: token?.slice(0, 10) + "...",
          userId
        });
    
        if (!token || !userId) {
          router.push('/login');
          return;
        }
    
        const response = await fetch('http://localhost:3000/api/dealer/dealer/cart/get', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ UserId: parseInt(userId, 10) }), // pastikan ini number
        });
    
        if (response.status === 404) {
          setCartItems([]); // kosongkan cart
          return;
        }
        

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error ${response.status}: ${text}`);
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP error ${response.status}: ${errText}`);
        }
        
    
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Response invalid: ${text.slice(0, 100)}`);
        }
    
        const data = await response.json();
        console.log("Full data response:", data); // Debug tambahan
    
        if (!data?.data?.CartItems) {
          throw new Error('Struktur data cart tidak valid');
        }
    
        setCartItems(data.data.CartItems.map((item: any) => ({
          Id: item.Id,
          Quantity: item.Quantity,
          ItemCode: {
            Id: item.ItemCode.Id,
            Name: item.ItemCode.Name,
            OEM: item.ItemCode.OEM,
            StockingTypeCode: item.ItemCode.StockingTypeCode,
            SalesCode: item.ItemCode.SalesCode,
            Weight: item.ItemCode.Weight
          }
        })) || []);
        
        console.log("CartPopup Loaded");
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };
    

    if (isOpen) fetchCartItems();
  }, [isOpen]);

  const handleCheckout = () => {
    onClose(); // Close the popup
    router.push('/checkout/checkoutpage'); // Navigate to the checkout page
  };

  if (!isOpen) return null;

  return (
    <div className="cart-popup bg-white p-4 rounded-lg shadow-lg w-80">
      <h2 className="font-bold text-lg mb-4">Your Cart</h2>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-700">
          {isLoggedIn ? 'Your cart is empty.' : 'Please login to view your cart.'}
        </p>
      ) : (
        <>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.Id} className="flex items-center border-b pb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{item.ItemCode.Name}</h3>
                  <p className="text-gray-600 text-sm">Weight: {item.ItemCode.Weight}kg</p>
                  <p className="text-gray-600 text-sm">Qty: {item.Quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartPopup;
