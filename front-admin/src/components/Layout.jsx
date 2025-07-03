import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import Headbar from "./Headbar";
import { useEffect, useState } from "react";
import axios from "axios";


const Layout = ({ children }) => {
  const router = useRouter();
  const hideSidebarAndHeader = router.pathname === "/login";
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setSessionExpired(true);
        return;
      }

      try {
        await axios.get("/api/admin/admin/session", {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        if (err.response?.status === 403) {
          setSessionExpired(true);
        }
      }
    };

    if (router.pathname !== "/login") {
      checkSession();
    }
  }, [router.pathname]);


  return (
    <div className="flex h-screen">
      {!hideSidebarAndHeader && <Sidebar isOpen={isSidebarOpen} />}

      <div className="flex flex-col flex-grow">
        {!hideSidebarAndHeader && (
          <Headbar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        {sessionExpired && router.pathname !== "/login" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center max-w-sm shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Sesi Habis</h2>
              <p className="text-sm text-gray-600 mb-5">
                Sesi Anda telah habis. Silakan login ulang untuk melanjutkan.
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                OK
              </button>
            </div>
          </div>
        )}
        


        <main className="pt-16 bg-gray-100 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
