"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const liststatistictransaction_1 = require("../../../controllers/admin-api/statistic/liststatistictransaction");
const auth_1 = require("../../../middlewares/admin/auth");
const express_1 = require("express");
const router = (0, express_1.Router)();
// Proteksi menu access "statistic"
router.post('/report/transaction', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("statistic"), // cek menu access
liststatistictransaction_1.getTransactionReportHandler);
router.get('/report/transaction/fetchoption', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("statistic"), liststatistictransaction_1.getStatisticFilterOptions);
// Routes for Price
exports.default = router;
