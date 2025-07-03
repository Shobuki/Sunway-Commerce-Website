import React from "react";
import { useEffect, useState } from "react";
import { hasMenuAccess, hasFeatureAccess } from "@/utils/access";
import axios from "@/utils/axios";
import ProductListCategory from "./list/ProductListCategory";
import ProductListAll from "./list/ProductListAll";
import PartNumberListAll from "./list/PartNumberListAll";
import ItemCodeAll from "./list/ItemCodeListAll";
import "./Product.css";


const Product = () => {
  const [menuAccess, setMenuAccess] = useState(null);
const [loadingAccess, setLoadingAccess] = useState(true);

  const [tab, setTab] = useState("category");
  useEffect(() => {
    axios.get("/api/admin/admin/access/my-menu").then(res => {
      const data = res.data || [];
      const found = data.find(m => m.Name?.toLowerCase() === "product");
      setMenuAccess(found || null);
      setLoadingAccess(false);
      if (!found) setTimeout(() => window.location.href = "/access-denied", 0);
    }).catch(() => {
      setMenuAccess(null);
      setLoadingAccess(false);
      setTimeout(() => window.location.href = "/access-denied", 0);
    });
  }, []);

  if (loadingAccess) return <div>Loading Access...</div>;
  if (!menuAccess) return null;

  return (
    <div className="product-container">
      <h1 className="title">Manage Products</h1>

      {/* ✅ Tabs Navigation */}
      <div className="tabs">
        <button className={tab === "category" ? "active" : ""} onClick={() => setTab("category")}>
          Products by Category
        </button>
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          All Products
        </button>
        <button className={tab === "PartNumberall" ? "active" : ""} onClick={() => setTab("PartNumberall")}>
          All Part Number
        </button>
        <button className={tab === "ItemCodeall" ? "active" : ""} onClick={() => setTab("ItemCodeall")}>
          Item Code
        </button>
      </div>

      {/* ✅ Render berdasarkan tab */}
      <div className="tab-content">
        {tab === "category" ? <ProductListCategory /> :
          tab === "all" ? <ProductListAll /> :
            tab === "ItemCodeall" ? <ItemCodeAll /> :
              <PartNumberListAll />}
      </div>
    </div>
  );
};

export default Product;
