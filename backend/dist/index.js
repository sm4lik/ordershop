"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)(config_1.corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api', routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Внутренняя ошибка сервера'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});
app.listen(config_1.PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${config_1.PORT}`);
    console.log(`📡 API доступно по адресу http://localhost:${config_1.PORT}/api`);
});
exports.default = app;
//# sourceMappingURL=index.js.map