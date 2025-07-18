import { Router } from "express";
import {listProductCategoriesWithProducts} from "../../../controllers/dealer-api/product/product"; 
import {getProductDetail,getProductImages,fetchPartNumberFromProduct} from "../../../controllers/dealer-api/product/productdetail"; 
import {getAllProductSpecificationFiles,downloadProductSpecificationFile,getLatestProductSpecificationFile} from "../../../controllers/dealer-api/product/productspecification"

const router = Router();


router.get("/product/list", listProductCategoriesWithProducts);
router.post("/product/detail/product/:id", getProductDetail);
router.get("/product/detail/image/:id", getProductImages);
router.post("/product/detail/options", fetchPartNumberFromProduct);

router.post("/product/detail/specification/files", getLatestProductSpecificationFile);
router.post("/product/detail/specification/files/download", downloadProductSpecificationFile);

export default router;
