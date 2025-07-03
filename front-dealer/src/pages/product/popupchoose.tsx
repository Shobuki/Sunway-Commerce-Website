import React, { useEffect, useState } from 'react';

interface PopupChooseProps {
  productId: number;
}

interface ItemPrice {
  Price: number;
}

interface ItemCode {
  Id: number;
  Name: string;
  QtyOnHand: number;
  OEM: string;
  Weight: number;
  Price: ItemPrice[];
  ItemCodeImage: { Image: string }[];
}

interface PartNumber {
  Id: number;
  Name: string;
  ItemCode: ItemCode[];
}

const PopupChoose: React.FC<PopupChooseProps> = ({ productId }) => {
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [selectedPartNumber, setSelectedPartNumber] = useState<PartNumber | null>(null);
  const [selectedItemCode, setSelectedItemCode] = useState<ItemCode | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);


  useEffect(() => {
    const fetchUserId = async () => {
      const token = sessionStorage.getItem('userToken');
      if (!token) {
        setError('Please login first.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/dealer/dealer/auth', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Gagal mengambil profil pengguna');
        
        const data = await response.json();
        setUserId(data.user.Id);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Gagal mengambil profil pengguna');
      }
    };

    fetchUserId();
  }, []);


  // Fetch part numbers and item codes
 useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        if (!token || !userId) {
          setError('Silakan login terlebih dahulu');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/dealer/dealer/product/detail/options`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, userId }),
        });

        if (!response.ok) throw new Error('Gagal mengambil data');

        const result = await response.json();
        setPartNumbers(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Gagal mengambil data');
      }
    };

    if (userId !== null) {
      fetchData();
    }
  }, [productId, userId]);

  // Handle adding item to the cart
 // Handle tambahkan item ke keranjang
 const addToCart = async () => {
  try {
    const token = sessionStorage.getItem('userToken');
    if (!token || !selectedItemCode || !userId) {
      setError('Silakan pilih item dan login terlebih dahulu');
      return;
    }

    const response = await fetch('http://localhost:3000/api/dealer/dealer/cart/add-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        UserId: userId,
        ItemCodeId: selectedItemCode.Id,
        Quantity: quantity,
      }),
    });

    if (!response.ok) throw new Error('Gagal menambahkan ke keranjang');

    const result = await response.json();
    alert('Item berhasil ditambahkan ke keranjang!');
    console.log(result);
  } catch (error) {
    console.error('Error adding to cart:', error);
    setError('Gagal menambahkan ke keranjang');
  }
};


  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold mb-4">Select Detail Product</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Dropdown for Part Numbers */}
      <div className="mb-4">
        <h2 className="text-md font-semibold mb-2">Select Part Number</h2>
        <div className="flex gap-3 flex-wrap">
          {partNumbers.map((part) => (
            <button
              key={part.Id}
              onClick={() => {
                setSelectedPartNumber(part);
                setSelectedItemCode(null); // Reset item code selection
              }}
              className={`py-2 px-4 rounded border ${
                selectedPartNumber?.Id === part.Id ? 'bg-red-600 text-white' : 'bg-white text-red-600'
              } hover:bg-red-700 hover:text-white transition`}
            >
              {part.Name}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown for Item Codes */}
      {selectedPartNumber && (
        <div className="mb-4">
          <h2 className="text-md font-semibold mb-2">Select Item Code</h2>
          <div className="flex gap-3 flex-wrap">
            {selectedPartNumber.ItemCode.map((item) => (
              <button
                key={item.Id}
                onClick={() => setSelectedItemCode(item)}
                className={`py-2 px-4 rounded border ${
                  selectedItemCode?.Id === item.Id ? 'bg-red-600 text-white' : 'bg-white text-red-600'
                } hover:bg-red-700 hover:text-white transition`}
              >
                {item.Name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display Item Details */}
      {selectedItemCode && (
        <div className="border p-4 rounded-lg shadow mb-4">
          <h3 className="font-semibold mb-2">Item Details:</h3>
          <p>Stock: {selectedItemCode.QtyOnHand}</p>
          <p>
            Price: {selectedItemCode.Price.length > 0 
              ? `Rp ${selectedItemCode.Price[0].Price.toLocaleString()}` 
              : 'No price available'}
          </p>
          <p>OEM: {selectedItemCode.OEM}</p>
          <p>Weight: {selectedItemCode.Weight} kg</p>
        </div>
      )}

      {/* Quantity Selector */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="border px-3 py-1 rounded"
        >
          -
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          className="border px-3 py-1 rounded w-16 text-center"
        />
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="border px-3 py-1 rounded"
        >
          +
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={addToCart}
        className="bg-red-600 text-white py-2 px-6 rounded hover:bg-red-700 transition"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default PopupChoose;
