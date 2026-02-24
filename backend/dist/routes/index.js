"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const userController = __importStar(require("../controllers/userController"));
const productController = __importStar(require("../controllers/productController"));
const categoryController = __importStar(require("../controllers/categoryController"));
const orderController = __importStar(require("../controllers/orderController"));
const reviewController = __importStar(require("../controllers/reviewController"));
const settingsController = __importStar(require("../controllers/settingsController"));
const transactionController = __importStar(require("../controllers/transactionController"));
const reportController = __importStar(require("../controllers/reportController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth_1.authenticate, authController.getProfile);
router.put('/auth/profile', auth_1.authenticate, authController.updateProfile);
// User routes (admin)
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController.getAll);
router.get('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), userController.getById);
router.post('/users', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController.create);
router.put('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController.update);
router.put('/users/:id/password', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController.updatePassword);
router.delete('/users/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), userController.remove);
router.get('/admin/stats', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), userController.getStats);
// Category routes
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.get('/categories/slug/:slug', categoryController.getBySlug);
router.post('/categories', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), categoryController.create);
router.put('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), categoryController.update);
router.delete('/categories/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), categoryController.remove);
// Product routes
router.get('/products', auth_1.optionalAuth, productController.getAll);
router.get('/products/popular', productController.getPopular);
router.get('/products/new', productController.getNew);
router.get('/products/:id', productController.getById);
router.get('/products/slug/:slug', productController.getBySlug);
router.post('/products', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), productController.create);
router.put('/products/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), productController.update);
router.delete('/products/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), productController.remove);
// Order routes
router.post('/orders', auth_1.optionalAuth, orderController.create);
router.get('/orders/my', auth_1.authenticate, orderController.getUserOrders);
router.get('/orders/my/stats', auth_1.authenticate, orderController.getUserStats);
router.get('/orders/recent', orderController.getRecent);
router.get('/orders/number/:number', orderController.getByNumber);
router.get('/orders', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator', 'bartender'), orderController.getAll);
router.get('/orders/:id', auth_1.authenticate, orderController.getById);
router.put('/orders/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), orderController.update);
router.put('/orders/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator', 'bartender'), orderController.updateStatus);
router.delete('/orders/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), orderController.remove);
// Review routes
router.get('/reviews/product/:productId', reviewController.getProductReviews);
router.post('/reviews', auth_1.authenticate, reviewController.create);
router.post('/reviews/:id/helpful', auth_1.authenticate, reviewController.updateHelpful);
router.get('/reviews', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reviewController.getAll);
router.put('/reviews/:id/approve', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reviewController.approve);
router.delete('/reviews/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reviewController.remove);
// Settings routes
router.get('/settings', settingsController.getAll);
router.put('/settings', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), settingsController.update);
// Transaction routes (accounting)
router.get('/transactions', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.getAll);
router.get('/transactions/stats', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.getStats);
router.get('/transactions/categories', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.getCategories);
router.post('/transactions', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.create);
router.put('/transactions/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.update);
router.delete('/transactions/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), transactionController.remove);
// Report routes (Excel/CSV export)
router.get('/reports/export/excel', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reportController.exportTransactionsToExcel);
router.get('/reports/export/csv', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reportController.exportTransactionsToCSV);
router.get('/reports/export/period', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reportController.exportPeriodReport);
router.get('/reports/export/category', auth_1.authenticate, (0, auth_1.authorize)('admin', 'moderator'), reportController.exportCategoryReport);
exports.default = router;
//# sourceMappingURL=index.js.map