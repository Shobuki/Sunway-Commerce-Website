import "../app/globals.css";
import Layout from "../components/Layout";
import { AccessProvider, useAccess } from "../contexts/AccessContext";
import FailedAccess from "../components/notification/FailedAccess";
import { ErrorProvider, useError } from "../contexts/ErrorContext";
import GlobalErrorPopup from "../components/notification/GlobalErrorPopup";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import React, { useEffect } from "react";
import { useRouter } from "next/router";

function AccessHandler({ children }) {
  const { failedAccess, failMsg } = useAccess();
  return failedAccess ? <FailedAccess message={failMsg} /> : children;
}

// Komponen untuk listen global-error event, filter langsung di sini
function GlobalErrorListener() {
  const { showError } = useError();
  useEffect(() => {
    function handler(e) {
      const msg = e.detail?.message || "Unknown error";
      // Filter agar error tertentu tidak ditampilkan popup
      const denyPattern = /(request|status|500|internal|server\s*error|request\s*failed)/i;
      if (denyPattern.test(msg)) return; // Tidak tampilkan error ini
      showError(msg);
    }
    window.addEventListener("global-error", handler);
    return () => window.removeEventListener("global-error", handler);
  }, [showError]);
  return null;
}

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // **Daftar halaman yang ingin dikecualikan dari error context & popup**
  const excludeErrorProvider = [
    "/listapprovalsalesorder/approvalsalesorder"
    // tambah path lain jika perlu
  ];
  const isExcluded = excludeErrorProvider.includes(router.pathname);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  // Jika halaman yang diexclude, render tanpa ErrorProvider dan GlobalErrorPopup
  if (isExcluded) {
    return (
      <AccessProvider>
        <AccessHandler>
          {getLayout(<Component {...pageProps} />)}
        </AccessHandler>
      </AccessProvider>
    );
  }

  // Default: render semua provider dan global error
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