// src/pages/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman home
    router.push('/home');
  }, [router]);

  return null; // Tidak perlu rendering apa-apa di halaman ini
}
