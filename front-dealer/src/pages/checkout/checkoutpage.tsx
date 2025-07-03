import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface ItemCode {
  Id: number;
  Name: string;
  OEM: string;
  Weight: number;
}

interface CartItem {
  Id: number;
  ItemCodeId: number;
  Quantity: number;
  ItemCode: ItemCode;
}

interface CartData {
  Id: number;
  UserId: number;
  CartItems: CartItem[];
}

const CheckoutPage = () => {
  const [cart, setCart] = useState<CartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Pindahkan akses sessionStorage ke useEffect klien
  useEffect(() => {
    setUserId(sessionStorage.getItem('userId'));
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Pastikan userId tersedia sebelum fetch
        if (!userId) return;

        const response = await fetch('http://localhost:3000/api/dealer/dealer/cart/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ UserId: userId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setCart(data.data);
      } catch (error) {
        setError('Failed to fetch cart data.');
        console.error(error);
      }
    };

    fetchCart();
  }, [userId]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    try {
      if (newQuantity < 1) {
        setError('Quantity cannot be less than 1.');
        return;
      }
  
      const token = sessionStorage.getItem('userToken');
      const userId = sessionStorage.getItem('userId');
  
      if (!token || !userId) {
        setError('User is not authenticated.');
        return;
      }
  
      const response = await fetch('http://localhost:3000/api/dealer/dealer/cart/add-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserId: Number(userId),
          ItemCodeId: itemId,
          Quantity: newQuantity,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Internal Server Error');
      }
  
      // Update cart state on success
      setCart((prevCart) => {
        if (!prevCart) return null;
        const updatedItems = prevCart.CartItems.map((item) =>
          item.ItemCodeId === itemId ? { ...item, Quantity: newQuantity } : item
        );
        return { ...prevCart, CartItems: updatedItems };
      });
  
      setSuccess('Cart updated successfully.');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error('Error updating cart:', error);
      setError('Failed to update cart. Please try again.');
    }
  };
  

  const handleSubmitOrder = async () => {
    try {
      const token = sessionStorage.getItem('userToken');
      const userId = sessionStorage.getItem('userId');
  
      if (!token || !userId) {
        setError('User is not authenticated.');
        return;
      }
  
      const response = await fetch('http://localhost:3000/api/dealer/dealer/salesorder/convert-cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ UserId: Number(userId) }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (data.message === "No Sales assigned to this Dealer.") {
          setError('No Sales representative is assigned to your dealer. Please contact support.');
        } else {
          setError(data.message || 'Failed to submit sales order.');
        }
        return;
      }
  
      setSuccess('Sales order submitted successfully!');
      setTimeout(() => {
        setSuccess(null);
        router.push('/home'); // Redirect after success
      }, 2000);
    } catch (error) {
      console.error('Error submitting sales order:', error);
      setError('Failed to submit sales order. Please try again.');
    }
  };
  
  

  const totalQuantity = cart?.CartItems?.reduce((total, item) => total + item.Quantity, 0) || 0;
  const totalWeight = cart?.CartItems?.reduce((total, item) => total + item.Quantity * item.ItemCode.Weight, 0) || 0;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {!cart || cart.CartItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cart.CartItems.map((item) => (
            <div key={item.Id} className="border p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">{item.ItemCode.Name}</h3>
              <p className="text-gray-700">OEM: {item.ItemCode.OEM}</p>
              <p className="text-gray-700">Weight: {item.ItemCode.Weight} kg</p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQuantityChange(item.ItemCodeId, item.Quantity - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.Quantity}
                  onChange={(e) => handleQuantityChange(item.ItemCodeId, Number(e.target.value))}
                  className="border px-3 py-1 rounded w-16 text-center"
                  min="1"
                />
                <button
                  onClick={() => handleQuantityChange(item.ItemCodeId, item.Quantity + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 border rounded-lg shadow bg-gray-50">
            <h3 className="text-lg font-bold mb-2">Summary</h3>
            <p>Total Items: {totalQuantity}</p>
            <p>Total Estimated Weight: {totalWeight.toFixed(2)} kg</p>
          </div>

          <button
            onClick={handleSubmitOrder}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Submit Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
