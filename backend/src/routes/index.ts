import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import * as productController from '../controllers/productController';
import * as categoryController from '../controllers/categoryController';
import * as orderController from '../controllers/orderController';
import * as reviewController from '../controllers/reviewController';
import * as settingsController from '../controllers/settingsController';
import * as transactionController from '../controllers/transactionController';
import * as reportController from '../controllers/reportController';
import * as paymentController from '../controllers/paymentController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/profile', authenticate, authController.updateProfile);

// User routes (admin)
router.get('/users', authenticate, authorize('admin'), userController.getAll);
router.get('/users/:id', authenticate, authorize('admin', 'moderator'), userController.getById);
router.post('/users', authenticate, authorize('admin'), userController.create);
router.put('/users/:id', authenticate, authorize('admin'), userController.update);
router.put('/users/:id/password', authenticate, authorize('admin'), userController.updatePassword);
router.delete('/users/:id', authenticate, authorize('admin'), userController.remove);
router.get('/admin/stats', authenticate, authorize('admin', 'moderator'), userController.getStats);

// Category routes
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.getById);
router.get('/categories/slug/:slug', categoryController.getBySlug);
router.post('/categories', authenticate, authorize('admin', 'moderator'), categoryController.create);
router.put('/categories/:id', authenticate, authorize('admin', 'moderator'), categoryController.update);
router.delete('/categories/:id', authenticate, authorize('admin', 'moderator'), categoryController.remove);

// Product routes
router.get('/products', optionalAuth, productController.getAll);
router.get('/products/popular', productController.getPopular);
router.get('/products/new', productController.getNew);
router.get('/products/:id', productController.getById);
router.get('/products/slug/:slug', productController.getBySlug);
router.post('/products', authenticate, authorize('admin', 'moderator'), productController.create);
router.put('/products/:id', authenticate, authorize('admin', 'moderator'), productController.update);
router.delete('/products/:id', authenticate, authorize('admin', 'moderator'), productController.remove);

// Order routes
router.post('/orders', optionalAuth, orderController.create);
router.get('/orders/my', authenticate, orderController.getUserOrders);
router.get('/orders/my/stats', authenticate, orderController.getUserStats);
router.get('/orders/recent', orderController.getRecent);
router.get('/orders/number/:number', orderController.getByNumber);
router.get('/orders', authenticate, authorize('admin', 'moderator', 'bartender'), orderController.getAll);
router.get('/orders/:id', authenticate, orderController.getById);
router.put('/orders/:id', authenticate, authorize('admin', 'moderator'), orderController.update);
router.put('/orders/:id/status', authenticate, authorize('admin', 'moderator', 'bartender'), orderController.updateStatus);
router.delete('/orders/:id', authenticate, authorize('admin', 'moderator'), orderController.remove);

// Review routes
router.get('/reviews/product/:productId', reviewController.getProductReviews);
router.post('/reviews', authenticate, reviewController.create);
router.post('/reviews/:id/helpful', authenticate, reviewController.updateHelpful);
router.get('/reviews', authenticate, authorize('admin', 'moderator'), reviewController.getAll);
router.put('/reviews/:id/approve', authenticate, authorize('admin', 'moderator'), reviewController.approve);
router.delete('/reviews/:id', authenticate, authorize('admin', 'moderator'), reviewController.remove);

// Settings routes
router.get('/settings', settingsController.getAll);
router.put('/settings', authenticate, authorize('admin', 'moderator'), settingsController.update);

// Transaction routes (accounting)
router.get('/transactions', authenticate, authorize('admin', 'moderator'), transactionController.getAll);
router.get('/transactions/stats', authenticate, authorize('admin', 'moderator'), transactionController.getStats);
router.get('/transactions/categories', authenticate, authorize('admin', 'moderator'), transactionController.getCategories);
router.post('/transactions', authenticate, authorize('admin', 'moderator'), transactionController.create);
router.put('/transactions/:id', authenticate, authorize('admin', 'moderator'), transactionController.update);
router.delete('/transactions/:id', authenticate, authorize('admin', 'moderator'), transactionController.remove);

// Report routes (Excel/CSV export)
router.get('/reports/export/excel', authenticate, authorize('admin', 'moderator'), reportController.exportTransactionsToExcel);
router.get('/reports/export/csv', authenticate, authorize('admin', 'moderator'), reportController.exportTransactionsToCSV);
router.get('/reports/export/period', authenticate, authorize('admin', 'moderator'), reportController.exportPeriodReport);
router.get('/reports/export/category', authenticate, authorize('admin', 'moderator'), reportController.exportCategoryReport);

// Payment routes (YooMoney Wallet API)
router.get('/payment/auth-url', paymentController.getAuthUrl);
router.post('/payment/callback', paymentController.handleAuthCallback);
router.post('/payment/create', optionalAuth, paymentController.createPayment);
router.post('/payment/confirm', optionalAuth, paymentController.confirmPayment);
router.get('/payment/wallet-info', authenticate, authorize('admin'), paymentController.getWalletInfo);
router.get('/payment/history', authenticate, authorize('admin'), paymentController.getOperationHistory);
router.get('/payment/order/:orderId/status', paymentController.checkPaymentStatus);
router.post('/payment/webhook', paymentController.webhook);

export default router;
