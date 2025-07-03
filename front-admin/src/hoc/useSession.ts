import { useState, useEffect } from "react";
import axios from "axios";


interface Session {
  AdminName: string;
  AdminId: number;
  SalesId?: number;
  Role?: string;
}

const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionToken = sessionStorage.getItem("userToken");
      const localToken = localStorage.getItem("token");
      const token = sessionToken || localToken;

      if (!token) {
        setLoading(false);
        window.location.href = "/login";
        return;
      }

      try {
        const [sessionRes, roleRes] = await Promise.all([
          axios.get("/api/admin/admin/session", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/admin/admin/role", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const sessionData = sessionRes.data?.session || {};
        const roleData = roleRes.data?.role || null;

        setSession({ ...sessionData, Role: roleData });
      } catch (error) {
        console.error("Session or role fetch failed:", error);
        sessionStorage.removeItem("userToken");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { session, loading };
};

export default useSession;
