import {
    getTransactionReportHandler,
    getStatisticFilterOptions
} from '../../../controllers/admin-api/statistic/liststatistictransaction';
import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess,
} from "../../../middlewares/admin/auth";
import { Router } from 'express';

const router = Router();


// Proteksi menu access "statistic"
router.post(
  '/report/transaction',
  adminAuth,
  authorizeMenuAccess("statistic"), // cek menu access
  getTransactionReportHandler
);
router.get(
  '/report/transaction/fetchoption',
  adminAuth,
  authorizeMenuAccess("statistic"),
  getStatisticFilterOptions
);

// Routes for Price

export default router;