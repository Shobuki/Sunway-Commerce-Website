"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../../../middlewares/admin/auth");
const importproduct_1 = require("../../../../controllers/admin-api/product/importproduct");
const CrudProduct_1 = require("../../../../controllers/admin-api/product/CrudProduct");
const CrudProductImage_1 = require("../../../../controllers/admin-api/product/CrudProductImage");
const CrudProductSpecification_1 = require("../../../../controllers/admin-api/product/CrudProductSpecification");
const CrudProductCategory_1 = require("../../../../controllers/admin-api/product/CrudProductCategory");
const CrudProductCategoryImage_1 = require("../../../../controllers/admin-api/product/CrudProductCategoryImage");
const CrudPartNumber_1 = require("../../../../controllers/admin-api/product/CrudPartNumber");
const CrudItemCode_1 = require("../../../../controllers/admin-api/product/CrudItemCode");
const CrudProductBrand_1 = require("../../../../controllers/admin-api/product/CrudProductBrand");
//stock
const Stock_1 = require("../../../../controllers/admin-api/product/Stock");
const WarehouseItemcode_1 = require("../../../../controllers/admin-api/product/Warehouse/WarehouseItemcode");
const UpdateExcelStock_1 = require("../../../../controllers/admin-api/product/UpdateExcelStock");
const StockHistory_1 = require("../../../../controllers/admin-api/product/StockHistory");
//warehouse
const CrudWarehouse_1 = require(".././../../../controllers/admin-api/product/Warehouse/CrudWarehouse");
const router = (0, express_1.Router)();
//router.use(authenticateSuperAdmin);
router.post("/import-product-pdf", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), importproduct_1.importProductFromPDF);
//Product Routes
router.post("/products/main", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "createproduct"), CrudProduct_1.createProduct);
router.put("/products/main", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudProduct_1.updateProduct);
router.get("/products/main/all", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProduct_1.getAllProducts);
router.get("/products/main/category", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProduct_1.getProductCategoriesWithProducts);
router.get("/products/main/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProduct_1.getProductById);
router.delete("/products/main/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudProduct_1.deleteProduct);
//product image routes
router.post("/products/images", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudProductImage_1.uploadOrUpdateProductImage);
router.get("/products/images/:Id", CrudProductImage_1.getProductImagesByProductId);
router.delete("/products/images/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudProductImage_1.deleteProductImage);
//product specification file routes
router.post("/products/specification-files/upload", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudProductSpecification_1.uploadProductSpecificationFile);
router.post("/products/specification-files/product", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProductSpecification_1.getProductSpecificationFile);
router.post("/products/specification-files/download", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProductSpecification_1.downloadProductSpecificationFile);
router.post("/products/specification-files/delete", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudProductSpecification_1.deleteProductSpecificationFile);
// ProductCategory Routes
// Create/edit kategori
router.post("/products/categories", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "managecategory"), CrudProductCategory_1.upsertProductCategory);
router.get("/products/categories", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudProductCategory_1.getAllProductCategories);
router.delete("/products/categories/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "managecategory"), CrudProductCategory_1.deleteProductCategory);
//product category image routes
router.post("/products/productcategories/images", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudProductCategoryImage_1.uploadProductCategoryImage);
router.get("/products/productcategories/images/:Id", CrudProductCategoryImage_1.getProductCategoryImages);
router.delete("/products/productcategories/images/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudProductCategoryImage_1.deleteProductCategoryImage);
//partnumber routes
router.get("/products/part-numbers", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudPartNumber_1.getAllProductsWithPartNumbers);
router.get("/products/part-numbers/products/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudPartNumber_1.getPartNumbersByProductId);
router.get("/products/part-numbers/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudPartNumber_1.getPartNumberById);
router.post("/products/part-numbers", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "createproduct"), CrudPartNumber_1.createPartNumber);
router.put("/products/part-numbers", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudPartNumber_1.updatePartNumber);
router.delete("/products/part-numbers/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudPartNumber_1.deletePartNumber);
//item codes routes
router.get("/products/item-codes", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudItemCode_1.getAllItemCodeWithPartNumbers);
router.get("/products/item-codes/item/:partNumberId", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudItemCode_1.getItemCodeByPartNumber);
router.get("/products/item-codes/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("product"), CrudItemCode_1.getItemCodeById);
router.post("/products/item-codes", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "createproduct"), CrudItemCode_1.createItemCode);
router.put("/products/item-codes/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "editproduct"), CrudItemCode_1.updateItemCode);
// Delete
router.delete("/products/item-codes/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("product", "deleteproduct"), CrudItemCode_1.deleteItemCode);
// ProductBrand Routes
router.post("/products/product-brands", CrudProductBrand_1.createProductBrand);
router.put("/products/product-brands/:Id", CrudProductBrand_1.updateProductBrand);
router.get("/products/product-brands", CrudProductBrand_1.getAllProductBrands);
router.delete("/producs/product-brands/:Id", CrudProductBrand_1.deleteProductBrand);
//stock routes
router.post("/products/stock", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("stock"), Stock_1.getStockData);
router.put("/products/stock", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "editstockmanual"), Stock_1.updateStock);
router.post("/products/stock/excel", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "updateexcel"), UpdateExcelStock_1.upload.single("file"), UpdateExcelStock_1.updateStockFromExcel);
router.get("/products/stock/history/options", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("stock"), StockHistory_1.getStockHistoryOptions);
router.get("/products/stock/history", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("stock"), StockHistory_1.getStockHistory);
//warehouse routes
router.get("/products/warehouses", auth_1.adminAuth, CrudWarehouse_1.getWarehouses);
router.post("/products/warehouses", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "managewarehouse"), CrudWarehouse_1.createWarehouse);
router.put("/products/warehouses/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "managewarehouse"), CrudWarehouse_1.updateWarehouse);
router.delete("/products/warehouses/:Id", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "managewarehouse"), CrudWarehouse_1.deleteWarehouse);
// Relasi Warehouse dengan ItemCode (warehouseStock)
router.post("/products/warehouses/itemcode/add", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "managewarehouse"), WarehouseItemcode_1.addWarehouseToItemCode);
router.delete("/products/warehouses/itemcode/remove", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("stock", "managewarehouse"), WarehouseItemcode_1.removeWarehouseFromItemCode);
exports.default = router;
