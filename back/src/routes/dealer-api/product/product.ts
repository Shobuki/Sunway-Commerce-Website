import { Router } from "express";
import {listProductCategoriesWithProducts} from "../../../controllers/dealer-api/product/product"; 
import {getProductDetail,getProductImages,fetchPartNumberFromProduct} from "../../../controllers/dealer-api/product/productdetail"; 

const router = Router();


router.get("/product/list", listProductCategoriesWithProducts);
router.post("/product/detail/product/:id", getProductDetail);
router.get("/product/detail/image/:id", getProductImages);
router.post("/product/detail/options", fetchPartNumberFromProduct);


export default router;
