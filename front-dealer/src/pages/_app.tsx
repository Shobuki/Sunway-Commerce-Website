// src/pages/_app.tsx

import { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';
import '../styles/global.css'; // Import global CSS

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;