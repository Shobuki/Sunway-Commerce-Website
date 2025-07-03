'use client';
import React, { useEffect, useState } from "react";
import axios from "@/utils/axios";
import { hasMenuAccess } from "@/utils/access";
import "./Sales.css";
import { useRouter } from "next/router";

const Sales = () => {
  const router = useRouter();
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAccess, setMenuAccess] = useState(null);
  const [loadingAccess, setLoadingAccess] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/admin/access/my-menu")
      .then(res => {
        const access = (res.data || []).find(m => m.Name?.toLowerCase() === "sales");
        setMenuAccess(access || null);
        setLoadingAccess(false);
        // Jika tidak punya akses, redirect
        if (!access) {
          router.push("/access-denied");
        }
      })
      .catch(() => {
        setMenuAccess(null);
        setLoadingAccess(false);
        router.push("/access-denied");
      });
  }, [router.asPath]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get("/api/admin/admin/admins/list/sales");
        setSalesList(response.data.data || []);
      } catch (error) {
        // Cek jika errornya karena Unauthorized/Forbidden
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {

        } else {
          // Untuk error lain (misal koneksi), boleh alert atau tampilkan message
          alert("Failed to fetch sales list");
        }
        setSalesList([]); // Set array jadi kosong agar tabel tetap render
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!hasMenuAccess(menuAccess)) return null;
  return (
    <div className="sales-container ml-60">
      <div className="header">
        <h1>List Sales</h1>
      </div>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Region</th>
              <th>Gender</th>
            </tr>
          </thead>
          <tbody>
            {salesList.length > 0 ? (
              salesList.map((sales) => (
                <tr key={sales.Id}>
                  <td>{sales.Username}</td>
                  <td>{sales.Email}</td>
                  <td>{sales.Name}</td>
                  <td>{sales.PhoneNumber}</td>
                  <td>{sales.Address}</td>
                  <td>{sales.Region || "N/A"}</td>
                  <td>{sales.Gender}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No sales found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default Sales;
