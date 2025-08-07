"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../../../middlewares/admin/auth");
const CreateReadUser_1 = require("../../../../controllers/admin-api/manageuser/CreateReadUser");
const router = (0, express_1.Router)();
router.post('/users', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("manageuser"), CreateReadUser_1.createUser);
router.get('/users', auth_1.adminAuth, (0, auth_1.authorizeMenuAccess)("manageuser"), CreateReadUser_1.getUsers);
exports.default = router;
