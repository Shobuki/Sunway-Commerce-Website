import '../app/globals.css';  // Make sure your CSS import is correct
import { AppProps } from 'next/app';  // Import AppProps from next/app
import { AuthProvider } from '../context/authContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
