import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/authContext';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/home'); // Redirect setelah logout
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 text-red-500 hover:bg-red-100 w-full text-left">
      Logout
    </button>
  );
};

export default LogoutButton;
