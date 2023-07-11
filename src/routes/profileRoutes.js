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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5000000 }
}).single('display_pic');
//Edit photo
router.put('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }
        else {
            const samaImg = req.file;
            //@ts-ignore
            const user = req.user;
            if (!samaImg) {
                return res.status(400).json({ error: "Upload Image" });
            }
            try {
                const updatedUser = yield prisma.user.update({
                    where: { id: user.id },
                    data: {
                        display_pic: samaImg === null || samaImg === void 0 ? void 0 : samaImg.path
                    }
                });
                if (!updatedUser) {
                    res.status(404).json({ error: "Post does not exist" });
                }
                res.status(200).json(updatedUser);
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ error: "Something went wrong" });
            }
        }
    }));
}));
//@PUT Update profile
router.put('/update/details', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, firstname, lastname, display_phone_num, phone_number, } = req.body;
    //@ts-ignore
    const user = req.user;
    try {
        const updatedUser = yield prisma.user.update({
            where: { id: user.id },
            data: {
                username: username,
                email: email === null || email === void 0 ? void 0 : email.toLowerCase(),
                firstname,
                lastname,
                phone_number,
                display_phone_num
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}));
exports.default = router;
