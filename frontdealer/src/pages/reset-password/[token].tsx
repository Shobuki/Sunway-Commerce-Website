'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (token) {
      axios
        .get(`/api/dealer/dealer/profile/reset/getresetemailtoken/${token}`)
        .then((res) => setEmail(res.data.email))
        .catch(() => setStatus('Token tidak valid atau sudah digunakan.'));
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      setStatus('Password wajib diisi.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('Password tidak sama.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{5,}$/.test(newPassword)) {
      setStatus('Password minimal 5 karakter dan kombinasi huruf + angka.');
      return;
    }

    try {
      const res = await axios.post('/api/dealer/dealer/profile/reset/resetpassword', {
        token,
        newPassword,
      });
      setStatus('Password berhasil diubah. Anda akan diarahkan...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setStatus(err.response?.data?.message || 'Terjadi kesalahan saat reset.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/logo/sunway-logo.png" alt="Sunway Logo" width={200} height={80} />
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2 text-center">Reset Password</h2>
        <p className="text-gray-600 text-sm mb-4 text-center">Untuk: <span className="font-semibold">{email || '...'}</span></p>
        {status && <p className="text-red-500 text-sm text-center mb-3">{status}</p>}
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Password baru"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Konfirmasi password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
