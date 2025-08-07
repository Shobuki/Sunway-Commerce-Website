"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = require("../../../controllers/admin-api/manageemail/email");
const auth_1 = require("../../../middlewares/admin/auth");
const router = (0, express_1.Router)();
// Email Template Routes
router.get("/email/template", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("emailsetting"), // Menu access
email_1.getAllEmailTemplates);
router.post("/email/template", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("emailsetting", "createtemplate"), // Fitur: create
email_1.createEmailTemplate);
router.put("/email/template/", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("emailsetting", "editemplate"), // Fitur: edit
email_1.updateEmailTemplate);
router.delete("/email/template/", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("emailsetting", "deletetemplate"), // Fitur: delete
email_1.deleteEmailTemplate);
// Email Config Routes
// Email Config Routes (hanya 1 fitur: setconfig)
router.get("/email/config", auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("emailsetting"), email_1.getAllEmailConfigs);
router.put("/email/config", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("emailsetting", "setconfig"), email_1.upsertEmailConfig);
router.delete("/email/config", auth_1.adminAuth, (0, auth_1.authorizeMenuFeatureAccess)("emailsetting", "setconfig"), email_1.deleteEmailConfig);
exports.default = router;
