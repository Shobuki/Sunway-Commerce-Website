"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//main route
const express_1 = require("express");
const auth_1 = __importDefault(require("../../controllers/admin-api/auth"));
const ProfileController_1 = __importDefault(require("../../routes/admin-api/admin/ProfileController"));
//route superadmin
const CrudAdmin_1 = __importDefault(require("./admin/manageadmin/CrudAdmin"));
const CrudAdminRoles_1 = __importDefault(require("./admin/manageadmin/CrudAdminRoles"));
const notification_1 = __importDefault(require("./admin/notification"));
//route menuseed
const Seed_1 = __importDefault(require("./Seed"));
//route dealer
const CrudDealer_1 = __importDefault(require("../admin-api/admin/managedealer/CrudDealer"));
//route user
const CrudUser_1 = __importDefault(require("./admin/manageuser/CrudUser"));
//route email
const email_1 = __importDefault(require("../admin-api/email/email"));
//route product
const CrudProduct_1 = __importDefault(require("./product/ManageProduct/CrudProduct"));
//route price
const CrudPrice_1 = __importDefault(require("./product/ManagePrice/CrudPrice"));
const CrudPriceCategory_1 = __importDefault(require("./product/ManagePrice/CrudPriceCategory"));
const salesorder_1 = __importDefault(require("./transaction/salesorder"));
const transaction_1 = __importDefault(require("./statistic/transaction"));
const access_1 = require("../../controllers/admin-api/manageadmin/access/access");
const adminApiRouter = (0, express_1.Router)();
// Rute untuk menu utama
adminApiRouter.use('/admin', auth_1.default);
adminApiRouter.use('/admin', ProfileController_1.default);
//rute untuk access
adminApiRouter.get('/admin/access', access_1.getAdminAccessMatrix);
adminApiRouter.put('/admin/access/update', access_1.updateRoleMenuAccess);
//rute untuk seed menu
adminApiRouter.use('/admin', Seed_1.default);
//rute admin
adminApiRouter.use('/admin', CrudAdmin_1.default);
adminApiRouter.use('/admin', CrudAdminRoles_1.default);
adminApiRouter.use('/admin', notification_1.default);
//rute dealer
adminApiRouter.use('/admin', CrudDealer_1.default);
//rute user
adminApiRouter.use('/admin', CrudUser_1.default);
//rute email
adminApiRouter.use('/admin', email_1.default);
//rute untuk product
adminApiRouter.use('/admin', CrudProduct_1.default);
adminApiRouter.use('/admin', CrudPriceCategory_1.default);
//rute untuk price
adminApiRouter.use('/admin', CrudPrice_1.default);
//rute untuk transaction
adminApiRouter.use('/admin', salesorder_1.default);
//rute untuk statistic
adminApiRouter.use('/admin', transaction_1.default);
exports.default = adminApiRouter;
