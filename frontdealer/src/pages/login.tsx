'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/header/navbar';
import { useRouter } from 'next/router';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false); // ⬅️ Tambahan
  const [forgotEmail, setForgotEmail] = useState(''); // ⬅️ Tambahan
  const [isSending, setIsSending] = useState(false); // ⬅️ Tambahan

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dealer/dealer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalMessage(data.message || 'Login failed. Please try again.');
        setShowModal(true);
        return;
      }

      sessionStorage.setItem('userToken', data.token);
      sessionStorage.setItem('userId', data.user.UserId.toString());

      setModalMessage('Login successful!');
      setShowModal(true);
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const syncSession = () => {
      const token = sessionStorage.getItem('userToken');
      if (!token) router.push('/login');
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    if (modalMessage === 'Login successful!') router.push('/home');
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/dealer/dealer/profile/reset/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Gagal mengirim email reset.');
      setModalMessage('Link reset password telah dikirim ke email Anda.');
    } catch (err: any) {
      setModalMessage(err.message || 'Gagal mengirim reset email.');
    } finally {
      setShowModal(true);
      setShowForgotModal(false);
      setIsSending(false);
    }
  };

  const Modal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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

  const ForgotPasswordModal = ({
    isOpen,
    onClose,
    onSubmit,
    isSending,
    forgotEmail,
    setForgotEmail,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isSending: boolean;
    forgotEmail: string;
    setForgotEmail: (email: string) => void;
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold mb-3 text-red-600">Reset Password</h3>
          <input
            type="email"
            autoFocus
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 mb-4"
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSending}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
            >
              {isSending ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  

  return (
   <>
      <Navbar />
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/logo/sunway-logo.png" alt="Sunway Logo" width={200} height={80} />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-6 text-center">Welcome Back</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-black font-semibold">
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
            <label htmlFor="password" className="block text-black font-semibold">
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

        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <Link href="/register" className="hover:underline text-red-600">
            Don&apos;t have an account?
          </Link>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="hover:underline text-red-600"
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {showModal && <Modal message={modalMessage} onClose={handleCloseModal} />}
      <ForgotPasswordModal
  isOpen={showForgotModal}
  onClose={() => setShowForgotModal(false)}
  onSubmit={handleForgotSubmit}
  isSending={isSending}
  forgotEmail={forgotEmail}
  setForgotEmail={setForgotEmail}
/>

    </div>
    </>
  );
};

export default Login;
