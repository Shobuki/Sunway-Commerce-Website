import express from "express";
import pricingRouter from "./pricing"; // import router pricing

const globalRouter = express.Router();

// Mount semua global route di sini
globalRouter.use("/pricing", pricingRouter);

// Tambah routing lain jika perlu...

export default globalRouter;
