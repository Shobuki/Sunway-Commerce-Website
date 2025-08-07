"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.updateAdmin = exports.getAdminById = exports.getAllAdmins = exports.createAdmin = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class Admin {
    constructor() {
        this.validateCreateAdminInput = (input) => {
            if (!input.Username || input.Username.length > 30)
                return 'Username maksimal 30 karakter';
            if (!input.Password || input.Password.length > 150)
                return 'Password maksimal 150 karakter';
            if (!input.Email || input.Email.length > 75)
                return 'Email maksimal 75 karakter';
            if (input.Name && input.Name.length > 50)
                return 'Name maksimal 50 karakter';
            if (input.PhoneNumber && input.PhoneNumber.length > 20)
                return 'PhoneNumber maksimal 20 karakter';
            if (input.Address && input.Address.length > 150)
                return 'Address maksimal 150 karakter';
            if (input.Gender && input.Gender.length > 10)
                return 'Gender maksimal 10 karakter';
            return null;
        };
        // Validasi untuk UPDATE (semua field opsional, jika diisi cek validasinya)
        this.validateUpdateAdminInput = (input) => {
            if (input.Username && input.Username.length > 30)
                return 'Username maksimal 30 karakter';
            if (input.Password)
                return 'Password tidak boleh diupdate lewat endpoint ini'; // Atau bisa skip, jika memang tidak bisa update password
            if (input.Email && input.Email.length > 75)
                return 'Email maksimal 75 karakter';
            if (input.Name && input.Name.length > 50)
                return 'Name maksimal 50 karakter';
            if (input.PhoneNumber && input.PhoneNumber.length > 20)
                return 'PhoneNumber maksimal 20 karakter';
            if (input.Address && input.Address.length > 150)
                return 'Address maksimal 150 karakter';
            if (input.Gender && input.Gender.length > 10)
                return 'Gender maksimal 10 karakter';
            return null;
        };
        this.createAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { Username, Password, Email, Name, Birthdate, PhoneNumber, Address, Gender, RoleId } = req.body;
                const errorMsg = this.validateCreateAdminInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(Password, 10);
                const newAdmin = yield prisma.admin.create({
                    data: {
                        Username,
                        Password: hashedPassword,
                        Email,
                        Name,
                        Birthdate: Birthdate ? new Date(Birthdate) : null,
                        PhoneNumber,
                        Address,
                        Gender,
                        RoleId: parseInt(RoleId, 10),
                    },
                });
                // Hilangkan Password dari hasil response
                // Cara 1: destructuring
                const { Password: _pw } = newAdmin, adminDataWithoutPassword = __rest(newAdmin, ["Password"]);
                res.status(201).json({ message: 'Admin created successfully', data: adminDataWithoutPassword });
            }
            catch (error) {
                console.error('Error creating admin:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.getAllAdmins = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const admins = yield prisma.admin.findMany({
                    where: { DeletedAt: null },
                    include: {
                        AdminRole: true,
                        Sales: { include: {} },
                    },
                });
                const formattedAdmins = admins.map((admin) => {
                    var _a;
                    return ({
                        Id: admin.Id,
                        Username: admin.Username,
                        Email: admin.Email,
                        Name: admin.Name,
                        Birthdate: admin.Birthdate,
                        PhoneNumber: admin.PhoneNumber,
                        Address: admin.Address,
                        Gender: admin.Gender,
                        Role: (_a = admin.AdminRole) === null || _a === void 0 ? void 0 : _a.Name,
                        IsSales: !!admin.Sales,
                        CreatedAt: admin.CreatedAt,
                    });
                });
                res.status(200).json({ data: formattedAdmins });
            }
            catch (error) {
                console.error('Error fetching admins:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.getAdminById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const admin = yield prisma.admin.findUnique({
                    where: { Id: parseInt(id, 10) },
                    include: {
                        AdminRole: true,
                        Sales: { include: {} },
                    },
                });
                if (!admin) {
                    res.status(404).json({ message: 'Admin not found' });
                    return;
                }
                const formattedAdmin = {
                    Id: admin.Id,
                    Username: admin.Username,
                    Email: admin.Email,
                    Name: admin.Name,
                    Birthdate: admin.Birthdate,
                    PhoneNumber: admin.PhoneNumber,
                    Address: admin.Address,
                    Gender: admin.Gender,
                    Role: (_a = admin.AdminRole) === null || _a === void 0 ? void 0 : _a.Name,
                    IsSales: !!admin.Sales,
                    CreatedAt: admin.CreatedAt,
                };
                res.status(200).json({ data: formattedAdmin });
            }
            catch (error) {
                console.error('Error fetching admin:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.updateAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const errorMsg = this.validateUpdateAdminInput(req.body);
                if (errorMsg) {
                    res.status(400).json({ error: errorMsg });
                    return;
                }
                const updateData = {};
                if (req.body.Username)
                    updateData.Username = req.body.Username;
                if (req.body.Email)
                    updateData.Email = req.body.Email;
                if (req.body.Name)
                    updateData.Name = req.body.Name;
                if (req.body.Birthdate)
                    updateData.Birthdate = new Date(req.body.Birthdate);
                if (req.body.PhoneNumber)
                    updateData.PhoneNumber = req.body.PhoneNumber;
                if (req.body.Address)
                    updateData.Address = req.body.Address;
                if (req.body.Gender)
                    updateData.Gender = req.body.Gender;
                if (req.body.RoleId)
                    updateData.RoleId = parseInt(req.body.RoleId, 10);
                if (Object.keys(updateData).length === 0) {
                    res.status(400).json({ error: 'No valid fields provided for update' });
                    return;
                }
                const updatedAdmin = yield prisma.admin.update({
                    where: { Id: parseInt(id, 10) },
                    data: updateData,
                });
                // Hilangkan Password dari hasil response
                const { Password: _pw } = updatedAdmin, adminDataWithoutPassword = __rest(updatedAdmin, ["Password"]);
                res.status(200).json({ message: 'Admin updated successfully', data: adminDataWithoutPassword });
            }
            catch (error) {
                console.error('Error updating admin:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
        this.deleteAdmin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const adminToDelete = yield prisma.admin.findUnique({
                    where: { Id: parseInt(id, 10) },
                    include: {
                        AdminRole: true,
                        Sales: true,
                    },
                });
                if (!adminToDelete) {
                    res.status(404).json({ message: 'Admin not found' });
                    return;
                }
                if (((_a = adminToDelete.AdminRole) === null || _a === void 0 ? void 0 : _a.Name) === 'superadmin') {
                    const superAdminCount = yield prisma.admin.count({
                        where: {
                            RoleId: adminToDelete.RoleId,
                            DeletedAt: null,
                        },
                    });
                    if (superAdminCount <= 1) {
                        res.status(400).json({ message: 'Cannot delete the last superadmin' });
                        return;
                    }
                }
                if (adminToDelete.Sales) {
                    res.status(400).json({ message: 'Cannot delete an admin assigned to sales' });
                    return;
                }
                yield prisma.admin.update({
                    where: { Id: parseInt(id, 10) },
                    data: { DeletedAt: new Date() },
                });
                res.status(200).json({ message: 'Admin deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting admin:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
// Instansiasi controller agar tetap bisa diimport (tanpa perlu .bind() lagi)
const adminController = new Admin();
exports.createAdmin = adminController.createAdmin;
exports.getAllAdmins = adminController.getAllAdmins;
exports.getAdminById = adminController.getAdminById;
exports.updateAdmin = adminController.updateAdmin;
exports.deleteAdmin = adminController.deleteAdmin;
