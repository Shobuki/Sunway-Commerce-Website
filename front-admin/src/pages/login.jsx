import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../components/image/logo/logo.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/admin/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
  
      if (!response.ok) {
        throw new Error("Invalid username/email or password.");
      }
  
      const data = await response.json();
      localStorage.setItem("token", data.token);
  
      // ✅ Ambil AdminId dari /session
      const sessionResponse = await fetch("/api/admin/admin/session", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const sessionData = await sessionResponse.json();
  
      if (sessionData.session?.AdminId) {
        localStorage.setItem("adminId", sessionData.session.AdminId);
      }
      if (sessionData.session?.SalesId) {
        localStorage.setItem("salesId", sessionData.session.SalesId);
      }
  
      router.push("/");
    } catch (error) {
      setError(error.message || "An error occurred during login.");
    }
  };
  

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-600 to-red-400">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <Image src={logo} alt="Logo" width={170} height={170} className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800">Welcome to Sunway</h1>
          <p className="text-gray-600">Login to manage your account</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Username or Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
