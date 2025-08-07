"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../../middlewares/admin/auth");
const salesorder_1 = require("../../../controllers/dealer-api/transaction/salesorder"); // ✅ Import dengan benar
const salesorderapproval_1 = require("../../../controllers/admin-api/managesalesorder/salesorderapproval"); // ✅ Import dengan benar
const emailsalesorderrecipient_1 = require("../../../controllers/admin-api/managesalesorder/email/emailsalesorderrecipient"); // ✅ Import dengan benar
const detailtransaction_1 = require("../../../controllers/admin-api/managesalesorder/detailtransaction"); // ✅ Import dengan benar
const Tax_1 = require("../../../controllers/admin-api/managesalesorder/Tax"); // ✅ Import dengan benar
const router = (0, express_1.Router)();
//router.post("/salesorder/getbysales",adminAuth,authorizeMenuAccess("approvesalesorder"), getSalesOrdersBySales);
router.post("/salesorder/getbysales", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("approvesalesorder"), salesorder_1.getSalesOrdersBySales);
router.get("/salesorder/getall", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("salesorder"), salesorder_1.getAllSalesOrders);
router.delete("/salesorder", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("salesorder", "deletesalesorder"), salesorder_1.deleteSalesOrder);
router.post("/salesorder/detail/fetchrelateditemcodes", detailtransaction_1.fetchRelatedItemCodes);
// --- REVIEW/APPROVE/REJECT sales order (fitur reviewsalesorder)
router.post("/salesorder/approval/approve", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "reviewsalesorder"), salesorderapproval_1.approveSalesOrder);
router.post("/salesorder/approval/reject", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "reviewsalesorder"), salesorderapproval_1.rejectSalesOrder);
router.put("/salesorder/approval/update", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "reviewsalesorder"), salesorderapproval_1.updateSalesOrderApproval);
router.post("/salesorder/approval/fetchwarehouseforitemcode", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)(["approvesalesorder", "salesorder"]), salesorderapproval_1.fetchWarehouseForItemCode);
// Create, Update, Delete
router.post("/salesorder/emailrecipient/create", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "createupdatedeleteemailrecipient"), emailsalesorderrecipient_1.createEmailRecipient);
router.post("/salesorder/emailrecipient/getbysalesid", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "listemailrecipient"), emailsalesorderrecipient_1.getRecipientsBySalesId);
router.put("/salesorder/emailrecipient/update", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "createupdatedeleteemailrecipient"), emailsalesorderrecipient_1.updateRecipient);
router.delete("/salesorder/emailrecipient/delete", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "createupdatedeleteemailrecipient"), emailsalesorderrecipient_1.deleteRecipient);
router.get("/salesorder/tax/getall", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "taxconfig"), Tax_1.getAllTax);
router.get("/salesorder/tax/getactive", auth_1.adminAuth, Tax_1.getActiveTax);
router.post("/salesorder/tax/upsert", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "taxconfig"), Tax_1.upsertTax);
router.delete("/salesorder/tax/delete", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("approvesalesorder", "taxconfig"), Tax_1.deleteTax);
exports.default = router;
