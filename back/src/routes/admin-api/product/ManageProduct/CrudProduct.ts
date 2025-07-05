import { Router } from "express";
import { adminAuth, authorizeMenuAccess, authorizeMenuFeatureAccess } from "../../../../middlewares/admin/auth"
import { importProductFromPDF } from "../../../../controllers/admin-api/product/importproduct";
import {
  getAllProducts,
  getProductCategoriesWithProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../../controllers/admin-api/product/CrudProduct";

import {
  uploadOrUpdateProductImage,
  getProductImagesByProductId,
  deleteProductImage,
} from "../../../../controllers/admin-api/product/CrudProductImage"

import {
  upsertProductCategory,
  deleteProductCategory,
  getAllProductCategories,
  getCategoryWithHierarchy,
} from "../../../../controllers/admin-api/product/CrudProductCategory";

import {
  uploadProductCategoryImage,
  getProductCategoryImages,
  deleteProductCategoryImage,
} from "../../../../controllers/admin-api/product/CrudProductCategoryImage";

import {
  getAllProductsWithPartNumbers,
  getPartNumbersByProductId,
  getPartNumberById,
  createPartNumber,
  updatePartNumber,
  deletePartNumber,
} from "../../../../controllers/admin-api/product/CrudPartNumber";

import {
  getAllItemCodeWithPartNumbers,
  getItemCodeByPartNumber,
  getItemCodeById,
  createItemCode,
  updateItemCode,
  deleteItemCode,
} from "../../../../controllers/admin-api/product/CrudItemCode";


import {
  createProductBrand,
  updateProductBrand,
  deleteProductBrand,
  getAllProductBrands,
} from "../../../../controllers/admin-api/product/CrudProductBrand";

//stock
import { getStockData, updateStock } from "../../../../controllers/admin-api/product/Stock";
import { addWarehouseToItemCode, removeWarehouseFromItemCode } from "../../../../controllers/admin-api/product/Warehouse/WarehouseItemcode"
import { updateStockFromExcel, upload } from "../../../../controllers/admin-api/product/UpdateExcelStock"
import { getStockHistory, getStockHistoryOptions } from "../../../../controllers/admin-api/product/StockHistory";

//warehouse
import {
  createWarehouse,
  getWarehouses,
  updateWarehouse,
  deleteWarehouse
} from ".././../../../controllers/admin-api/product/Warehouse/CrudWarehouse";

import { authenticateSuperAdmin } from "../../../../middlewares/admin/authenticateSuperAdmin";

const router = Router();
//router.use(authenticateSuperAdmin);


router.post("/import-product-pdf", 
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  importProductFromPDF);
//Product Routes
router.post(
  "/products/main",
  adminAuth,
  authorizeMenuFeatureAccess("product", "createproduct"),
  createProduct
);
router.put(
  "/products/main",
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  updateProduct
);
router.get(
  "/products/main/all",
  adminAuth,
  authorizeMenuAccess("product"),
  getAllProducts
);
router.get(
  "/products/main/category",
  adminAuth,
  authorizeMenuAccess("product"),
  getProductCategoriesWithProducts
);
router.get(
  "/products/main/:Id",
  adminAuth,
  authorizeMenuAccess("product"),
  getProductById
);
router.delete(
  "/products/main/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "deleteproduct"),
  deleteProduct
);

//product image routes
router.post("/products/images",
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  uploadOrUpdateProductImage);
router.get("/products/images/:Id", getProductImagesByProductId);
router.delete("/products/images/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "deleteproduct"),
  deleteProductImage);

// ProductCategory Routes
// Create/edit kategori
router.post(
  "/products/categories",
  adminAuth,
  authorizeMenuFeatureAccess("product", "managecategory"),
  upsertProductCategory
);
router.get(
  "/products/categories",
  adminAuth,
  authorizeMenuAccess("product"),
  getAllProductCategories
);
router.delete(
  "/products/categories/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "managecategory"),
  deleteProductCategory
);

//product category image routes
router.post("/products/productcategories/images",
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  uploadProductCategoryImage);
router.get("/products/productcategories/images/:Id", getProductCategoryImages);
router.delete("/products/productcategories/images/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "deleteproduct"),
  deleteProductCategoryImage);



//partnumber routes
router.get(
  "/products/part-numbers",
  adminAuth,
  authorizeMenuAccess("product"),
  getAllProductsWithPartNumbers
);
router.get(
  "/products/part-numbers/products/:Id",
  adminAuth,
  authorizeMenuAccess("product"),
  getPartNumbersByProductId
);
router.get(
  "/products/part-numbers/:Id",
  adminAuth,
  authorizeMenuAccess("product"),
  getPartNumberById
);
router.post(
  "/products/part-numbers",
  adminAuth,
  authorizeMenuFeatureAccess("product", "createproduct"),
  createPartNumber
);
router.put(
  "/products/part-numbers",
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  updatePartNumber
);
router.delete(
  "/products/part-numbers/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "deleteproduct"),
  deletePartNumber
);

//item codes routes
router.get(
  "/products/item-codes",
  adminAuth,
  authorizeMenuAccess("product"),
  getAllItemCodeWithPartNumbers
);
router.get(
  "/products/item-codes/item/:partNumberId",
  adminAuth,
  authorizeMenuAccess("product"),
  getItemCodeByPartNumber
);
router.get(
  "/products/item-codes/:Id",
  adminAuth,
  authorizeMenuAccess("product"),
  getItemCodeById
);
router.post(
  "/products/item-codes",
  adminAuth,
  authorizeMenuFeatureAccess("product", "createproduct"),
  createItemCode
);
router.put(
  "/products/item-codes/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "editproduct"),
  updateItemCode
);
// Delete
router.delete(
  "/products/item-codes/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("product", "deleteproduct"),
  deleteItemCode
);


// ProductBrand Routes
router.post("/products/product-brands", createProductBrand);
router.put("/products/product-brands/:Id", updateProductBrand);
router.get("/products/product-brands", getAllProductBrands);
router.delete("/producs/product-brands/:Id", deleteProductBrand);

//stock routes
router.post(
  "/products/stock",
  adminAuth,
  authorizeMenuAccess("stock"),
  getStockData
);
router.put(
  "/products/stock",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "editstockmanual"),
  updateStock
);
router.post(
  "/products/stock/excel",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "updateexcel"),
  upload.single("file"),
  updateStockFromExcel
);


router.get(
  "/products/stock/history/options",
  adminAuth,
  authorizeMenuAccess("stock"),
  getStockHistoryOptions
);
router.get(
  "/products/stock/history",
  adminAuth,
  authorizeMenuAccess("stock"),
  getStockHistory
);


//warehouse routes
router.get(
  "/products/warehouses",
  adminAuth,
  getWarehouses
);
router.post(
  "/products/warehouses",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "managewarehouse"),
  createWarehouse
);
router.put(
  "/products/warehouses/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "managewarehouse"),
  updateWarehouse
);
router.delete(
  "/products/warehouses/:Id",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "managewarehouse"),
  deleteWarehouse
);

// Relasi Warehouse dengan ItemCode (warehouseStock)
router.post(
  "/products/warehouses/itemcode/add",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "managewarehouse"),
  addWarehouseToItemCode
);

router.delete(
  "/products/warehouses/itemcode/remove",
  adminAuth,
  authorizeMenuFeatureAccess("stock", "managewarehouse"),
  removeWarehouseFromItemCode
);


export default router;
