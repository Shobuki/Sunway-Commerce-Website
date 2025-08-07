"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // ✅ lebih konsisten
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const admin_api_1 = __importDefault(require("./routes/admin-api"));
const dealer_api_1 = __importDefault(require("./routes/dealer-api"));
const global_api_1 = __importDefault(require("./routes/global-api"));
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3002',
    'http://localhost:3001',
    'http://sunflexstoreindonesia.com:3001',
    'http://sunflexstoreindonesia.com:3002',
    'https://sunflexstoreindonesia.com',
    'http://sunflexstoreindonesia.com',
    'https://sunflexstoreindonesia.com:3001',
    'https://sunflexstoreindonesia.com:3002',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        //  console.log('========== CORS DEBUG ==========');
        //   console.log('CORS Origin:', origin, '| length:', origin ? origin.length : '-');
        for (const o of allowedOrigins) {
            console.log('Allowed:', o, '| length:', o.length, '| match:', o === origin);
        }
        if (!origin || allowedOrigins.includes(origin)) {
            //   console.log('>>> ALLOWED', origin);
            callback(null, true);
        }
        else {
            //  console.log('>>> BLOCKED', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));
// Middleware JSON and URL-encoded parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware for static files
//middleware product category image
app.use('/images/product/productcategoryimage', express_1.default.static(path_1.default.join(__dirname, '../public/admin/images/product/productcategoryimage')));
//middleware product image
app.use('/images/product/productimage', express_1.default.static(path_1.default.join(__dirname, '../public/admin/images/product/productimage')));
//middleware item code image
app.use('/images/product/itemcode/itemcodeimage', express_1.default.static(path_1.default.join(__dirname, '../public/admin/images/product/itemcodeimage')));
//middlware product specification file
app.use('/images/product/productspecification', express_1.default.static(path_1.default.join(__dirname, '../public/admin/images/product/productspecification')));
//middleware profile image admin
app.use('/images/profile', express_1.default.static(path_1.default.join(__dirname, '../public/admin/images/profile')));
//middleware profile image user
app.use('/images/user/profile', express_1.default.static(path_1.default.join(__dirname, '../public/dealer/images/profile')));
//middleware dll (blm guna)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Logging middleware
app.use((req, res, next) => {
    if (!req.url.startsWith('/images') && req.url !== '/') {
        // console.log('Request Method:', req.method);
        //  console.log('Request URL:', req.url);
        //  console.log('Request Headers:', req.headers);
        //  console.log('Request Body:', req.body);
    }
    next();
});
// Routes
app.use('/api/admin', admin_api_1.default);
app.use('/api/dealer', dealer_api_1.default);
app.use('/api/global', global_api_1.default);
// Handle CORS preflight
app.options('*', (0, cors_1.default)());
// Base route
app.get('/', (req, res) => {
    res.send('API is working!');
});
app.use((err, req, res, next) => {
    console.error("[GLOBAL ERROR]", err);
    if (res.headersSent) {
        return;
    }
    res.status(200).json({
        success: false,
        message: "Terjadi error internal. Coba lagi atau hubungi admin.",
    });
});
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
