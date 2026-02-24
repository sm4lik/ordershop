"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Auth middleware: No authorization header');
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        const token = authHeader.substring(7);
        console.log('Auth middleware: Token received, verifying...');
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.user = decoded;
        console.log('Auth middleware: User authenticated:', req.user);
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Неверный токен' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('OptionalAuth: Authorization header:', authHeader ? 'present' : 'missing');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            console.log('OptionalAuth: Token received, verifying...');
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            req.user = decoded;
            console.log('OptionalAuth: User authenticated:', req.user);
        }
        else {
            console.log('OptionalAuth: No valid token, proceeding as guest');
        }
        next();
    }
    catch (error) {
        console.log('OptionalAuth: Token verification failed, proceeding as guest');
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map