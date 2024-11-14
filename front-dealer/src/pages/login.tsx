import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // identifier bisa berupa email atau username
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false); // State untuk menampilkan modal
  const [modalMessage, setModalMessage] = useState(''); // Pesan yang akan ditampilkan di modal
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API call to authenticate user
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }), // kirim identifier dan password
      });

      if (!response.ok) {
        setModalMessage('Invalid username/email or password');
        setShowModal(true); // Menampilkan modal dengan pesan error
        return;
      }

      // Handle session logic
      const data = await response.json();
      sessionStorage.setItem('userToken', data.token); // simpan token dalam sessionStorage

      setModalMessage('Login successful!'); // Menampilkan modal dengan pesan berhasil login
      setShowModal(true);
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalMessage === 'Login successful!') {
      router.push('/home'); // Redirect ke halaman home setelah login berhasil
    }
  };

  // Komponen Modal langsung di dalam login.tsx
  const Modal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <p className="text-center">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/logo/sunway-logo.png" alt="Sunway Logo" width={200} height={80} />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Welcome Back</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-gray-700 font-semibold">
              Username or Email
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Login
          </button>
        </form>
        <p className="text-gray-600 text-center mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-600 hover:underline">
            Register
          </Link>
        </p>
      </div>

      {showModal && <Modal message={modalMessage} onClose={handleCloseModal} />} {/* Tampilkan modal */}
    </div>
  );
};

export default Login;
