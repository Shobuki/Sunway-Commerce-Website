// src/pages/_app.tsx
import '../styles/global.css';
import { AppProps } from 'next/app';
import { AuthProvider } from '../context/authContext';
import GlobalErrorPopup from '../components/GlobalErrorPopup';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <GlobalErrorPopup />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
