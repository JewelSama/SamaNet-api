"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.static('../public'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const port = process.env.Port;
app.use('/user', userRoutes_1.default);
app.use('/post', authMiddleware_1.authenticateToken, postRoutes_1.default);
app.use('/post/comment', authMiddleware_1.authenticateToken, commentRoutes_1.default);
app.use('/user/profile', authMiddleware_1.authenticateToken, profileRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to SamaNet');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
