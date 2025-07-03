import { Router } from "express";
import {
  getAllEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailConfigs,
upsertEmailConfig,
  deleteEmailConfig,
} from "../../../controllers/admin-api/manageemail/email";

import {
  adminAuth,
  authorizeMenuAccess,
  authorizeMenuFeatureAccess,
} from "../../../middlewares/admin/auth";

const router = Router();

// Email Template Routes
router.get(
  "/email/template",
  adminAuth,
  authorizeMenuAccess("emailsetting"),         // Menu access
  getAllEmailTemplates
);
router.post(
  "/email/template",
  adminAuth,
  authorizeMenuFeatureAccess("emailsetting", "createtemplate"), // Fitur: create
  createEmailTemplate
);
router.put(
  "/email/template/",
  adminAuth,
  authorizeMenuFeatureAccess("emailsetting", "editemplate"),    // Fitur: edit
  updateEmailTemplate
);
router.delete(
  "/email/template/",
  adminAuth,
  authorizeMenuFeatureAccess("emailsetting", "deletetemplate"), // Fitur: delete
  deleteEmailTemplate
);

// Email Config Routes
// Email Config Routes (hanya 1 fitur: setconfig)
router.get(
  "/email/config",
  adminAuth,
  authorizeMenuAccess("emailsetting"),
  getAllEmailConfigs
);
router.put(
  "/email/config",
  adminAuth,
  authorizeMenuFeatureAccess("emailsetting", "setconfig"),
  upsertEmailConfig
);
router.delete(
  "/email/config",
  adminAuth,
  authorizeMenuFeatureAccess("emailsetting", "setconfig"),
  deleteEmailConfig
);

export default router;
