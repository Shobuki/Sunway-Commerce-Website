import "../app/globals.css";
import Layout from "../components/Layout";
import { AccessProvider, useAccess } from "../contexts/AccessContext";
import FailedAccess from "../components/notification/FailedAccess";
import { ErrorProvider } from "../contexts/ErrorContext";
import GlobalErrorPopup from "../components/notification/GlobalErrorPopup";

// Handler global: tampilkan FailedAccess jika state failed
function AccessHandler({ children }) {
  const { failedAccess, failMsg } = useAccess();
  return failedAccess ? <FailedAccess message={failMsg} /> : children;
}

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <ErrorProvider>
      <AccessProvider>
        <AccessHandler>
          <GlobalErrorPopup />
          {getLayout(<Component {...pageProps} />)}
        </AccessHandler>
      </AccessProvider>
    </ErrorProvider>
  );
}
