import "../app/globals.css";
import Layout from "../components/Layout";
import { AccessProvider, useAccess } from "../contexts/AccessContext";
import FailedAccess from "../components/notification/FailedAccess";
import { ErrorProvider, useError } from "../contexts/ErrorContext";
import GlobalErrorPopup from "../components/notification/GlobalErrorPopup";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import React, { useEffect } from "react";

// Handler global: tampilkan FailedAccess jika state failed
function AccessHandler({ children }) {
  const { failedAccess, failMsg } = useAccess();
  return failedAccess ? <FailedAccess message={failMsg} /> : children;
}

// Komponen untuk listen global-error event, langsung pakai useError context
function GlobalErrorListener() {
  const { showError } = useError();
  useEffect(() => {
    function handler(e) {
      const msg = e.detail?.message || "Unknown error";
      // Filter agar error yang tidak perlu, tidak ditampilkan popup
      const denyPattern = /(request|status|500|internal|server\s*error|request\s*failed)/i;
      if (denyPattern.test(msg)) return;
      showError(msg);
    }
    window.addEventListener("global-error", handler);
    return () => window.removeEventListener("global-error", handler);
  }, [showError]);
  return null;
}

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);
  return (
    <ErrorProvider>
      <AccessProvider>
        <AccessHandler>
          <GlobalErrorListener />
          <GlobalErrorPopup />
          {getLayout(<Component {...pageProps} />)}
        </AccessHandler>
      </AccessProvider>
    </ErrorProvider>
  );
}
