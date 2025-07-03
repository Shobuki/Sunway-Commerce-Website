import { Router } from "express";
import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess,
} from "../../../middlewares/admin/auth";
import {
    convertCartToSalesOrder,
    getSalesOrdersByUserDealer,
    getSalesOrdersBySales,
    updateSalesOrder,
    getAllSalesOrders,
    deleteSalesOrder,

} from "../../../controllers/dealer-api/transaction/salesorder"; // ✅ Import dengan benar

import {
    approveSalesOrder,
    rejectSalesOrder,
    updateSalesOrderApproval,
} from "../../../controllers/admin-api/managesalesorder/salesorderapproval"; // ✅ Import dengan benar

import {
    createEmailRecipient,
    getRecipientsBySalesId,
    updateRecipient,
    deleteRecipient,

} from "../../../controllers/admin-api/managesalesorder/email/emailsalesorderrecipient"; // ✅ Import dengan benar

import {fetchRelatedItemCodes} from "../../../controllers/admin-api/managesalesorder/detailtransaction"; // ✅ Import dengan benar

import {getAllTax,getActiveTax,upsertTax,deleteTax} from "../../../controllers/admin-api/managesalesorder/Tax"; // ✅ Import dengan benar


const router = Router();

//router.post("/salesorder/getbysales",adminAuth,authorizeMenuAccess("approvesalesorder"), getSalesOrdersBySales);
router.post("/salesorder/getbysales",adminAuth,authorizeMenuAccess("approvesalesorder"), getSalesOrdersBySales);


router.get(
  "/salesorder/getall",
  adminAuth,
  authorizeMenuAccess("salesorder"),
  getAllSalesOrders
);
router.delete(
  "/salesorder",
  adminAuth,
  authorizeMenuFeatureAccess("salesorder", "deletesalesorder"),
  deleteSalesOrder
);
router.post("/salesorder/detail/fetchrelateditemcodes", fetchRelatedItemCodes);

// --- REVIEW/APPROVE/REJECT sales order (fitur reviewsalesorder)
router.post(
  "/salesorder/approval/approve",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "reviewsalesorder"),
  approveSalesOrder
);
router.post(
  "/salesorder/approval/reject",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "reviewsalesorder"),
  rejectSalesOrder
);
router.put(
  "/salesorder/approval/update",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "reviewsalesorder"),
  updateSalesOrderApproval
);

// Create, Update, Delete
router.post(
  "/salesorder/emailrecipient/create",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "createupdatedeleteemailrecipient"),
  createEmailRecipient
);
router.post("/salesorder/emailrecipient/getbysalesid",adminAuth,authorizeMenuFeatureAccess("approvesalesorder","listemailrecipient"), getRecipientsBySalesId);
router.put(
  "/salesorder/emailrecipient/update",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "createupdatedeleteemailrecipient"),
  updateRecipient
);
router.delete(
  "/salesorder/emailrecipient/delete",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "createupdatedeleteemailrecipient"),
  deleteRecipient
);


router.get(
  "/salesorder/tax/getall",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "taxconfig"),
  getAllTax
);
router.get(
  "/salesorder/tax/getactive",
  adminAuth,
  getActiveTax
);
router.post(
  "/salesorder/tax/upsert",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "taxconfig"),
  upsertTax
);
router.delete(
  "/salesorder/tax/delete",
  adminAuth,
  authorizeMenuFeatureAccess("approvesalesorder", "taxconfig"),
  deleteTax
);


export default router;