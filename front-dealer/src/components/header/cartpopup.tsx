import React, { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart items when the popup is open
  useEffect(() => {
    async function fetchCartItems() {
      try {
        const token = sessionStorage.getItem('userToken'); // Ambil token dari sessionStorage
        if (!token) {
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true); // Set user sebagai logged in

        const response = await fetch('/api/cart/cart', {
          headers: {
            'Authorization': `Bearer ${token}`, // Kirim token di header
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil data keranjang');
        }

        const data = await response.json();
        setCartItems(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Gagal mengambil data keranjang');
      }
    }

    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen]);

  // Function to update quantity in the backend
  const updateCartQuantity = async (itemId: number, newQuantity: number) => {
    try {
      const token = sessionStorage.getItem('userToken');
      if (!token) {
        setError('Ayo login dulu');
        return;
      }

      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Terjadi error sistem');
      }

      const data = await response.json();
      setError(null); // Clear error if update succeeds
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Terjadi error sistem');
    }
  };

  // Handlers for increasing and decreasing quantity
  const handleIncreaseQuantity = (itemId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + 1;
          updateCartQuantity(itemId, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleDecreaseQuantity = (itemId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          updateCartQuantity(itemId, newQuantity);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  if (!isOpen) return null;

  return (
    <div className="cart-popup bg-white p-4 rounded-lg shadow-lg w-80">
      <h2 className="font-bold text-lg mb-4">Your Cart</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-700">
          {isLoggedIn ? 'Keranjang kamu kosong, ayo isi' : 'Ayo login dulu'}
        </p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} className="flex items-center mb-4">
            <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 mr-4" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleDecreaseQuantity(item.id)}
                  className="px-2 py-1 border rounded-l-md bg-gray-200 hover:bg-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b text-center">{item.quantity}</span>
                <button
                  onClick={() => handleIncreaseQuantity(item.id)}
                  className="px-2 py-1 border rounded-r-md bg-gray-200 hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CartPopup;
