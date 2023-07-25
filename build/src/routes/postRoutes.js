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
}).single('img_path');
//Get all Posts
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.$queryRawUnsafe(`SELECT p.*, u.username, u.display_pic FROM "Post" p JOIN "USER" u ON p.userId = u.id ORDER BY RANDOM()`);
        res.status(200).json(posts);
    }
    catch (error) {
        console.log(error);
        res.json(400);
    }
}));
//create Post
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { caption } = req.body
    // let samaImg = {};
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }
        else {
            const samaImg = req.file;
            const caption = req.body.caption;
            // console.log("jewwwllllll")
            // console.log(samaImg)
            if (!caption && !samaImg) {
                return res.status(400).json({ error: "Post cannot be empty" });
            }
            // @ts-ignore
            const user = req.user;
            //  console.log(samaImg?.path)
            try {
                const post = yield prisma.post.create({
                    data: {
                        caption,
                        userId: user.id,
                        img_path: samaImg === null || samaImg === void 0 ? void 0 : samaImg.path
                    },
                    include: {
                        user: true,
                        likes: true,
                        comments: true,
                        savedposts: true,
                    }
                });
                res.status(201).json(post);
            }
            catch (error) {
                console.log(error);
            }
        }
    }));
}));
// @PUT Edit post
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }
        else {
            const samaImg = req.file;
            const caption = req.body.caption;
            if (!caption && !samaImg) {
                return res.status(400).json({ error: "Fill in fields" });
            }
            const post = yield prisma.post.update({
                where: { id: Number(id) },
                data: {
                    caption,
                    img_path: samaImg === null || samaImg === void 0 ? void 0 : samaImg.path
                }
            });
            if (!post) {
                res.status(404).json({ error: "Post does not exist" });
            }
            res.status(200).json(post);
        }
    }));
}));
// @DELETE @Private delete Posts
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.post.delete({
            where: { id: Number(id) }
        });
        res.sendStatus(200);
    }
    catch (error) {
        return res.status(404).json({ error: "Post does not exist" });
    }
}));
router.post('/like/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    //@ts-ignore
    const user = req.user;
    const post = yield prisma.post.findUnique({ where: { id: Number(id) }, include: { likes: true } });
    // @ts-ignore 
    const likes = yield prisma.like.findMany({ where: { postId: post === null || post === void 0 ? void 0 : post.id }, select: { userId: true } });
    // console.log(likes)
    const userLikes = likes.map((like) => like.userId);
    const hasLikes = userLikes.includes(user.id);
    // console.log(hasLikes)
    if (post) {
        try {
            if (hasLikes) {
                return res.sendStatus(400);
            }
            const likedPost = yield prisma.like.create({
                data: {
                    userId: user.id,
                    postId: post === null || post === void 0 ? void 0 : post.id,
                },
                include: { user: {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            display_pic: true,
                        }
                    } }
            });
            res.status(201).json(likedPost);
        }
        catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    }
}));
//@DELETE unlike posts
// sending like id
router.delete('/like/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // @ts-ignore  
    const user = req.user;
    try {
        const like = yield prisma.like.findUnique({ where: { id: Number(id) } });
        if (like) {
            if (like.userId !== user.id) {
                return res.sendStatus(400);
            }
            else {
                yield prisma.like.delete({ where: { id: Number(id) } });
                return res.sendStatus(200);
            }
        }
        else {
            return res.sendStatus(404);
        }
    }
    catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
}));
//@POST Save Post
router.post('/save/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    //@ts-ignore
    const user = req.user;
    // console.log(user)
    const post = yield prisma.post.findUnique({ where: { id: Number(id) }, include: { savedposts: true } });
    if (!post) {
        return res.sendStatus(404);
    }
    // console.log(post)
    const savedPostss = post.savedposts;
    const saved = savedPostss.map((save) => save.userId);
    const alreadySaved = saved.includes(user.id);
    // console.log(alreadySaved)
    try {
        if (alreadySaved) {
            return res.status(400).json({ error: "Post already Saved" });
        }
        const newSavedPost = yield prisma.savedpost.create({
            data: {
                userId: user.id,
                postId: post.id,
            },
            include: { post: true }
        });
        // console.log(newSavedPost)
        res.status(200).json(newSavedPost);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ errror: "Something happened" });
    }
}));
//@DELETE removed posts from saved
router.delete('/save/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; //SavePost id
    //@ts-ignore
    const user = req.user;
    try {
        const savedPost = yield prisma.savedpost.findUnique({ where: { id: Number(id) } });
        // console.log(savedPost?.userId, user.id)
        if ((savedPost === null || savedPost === void 0 ? void 0 : savedPost.userId) !== user.id) {
            return res.status(200).json({ error: "Something went wrong" });
        }
        yield prisma.savedpost.delete({ where: { id: Number(id) } });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Something went wrong!" });
    }
}));
//@GET users saved posts
router.get('/save', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // const { id } = req.params; //user id
    // @ts-ignore
    const authUser = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const userSavedPost = yield prisma.savedpost.findMany({ where: { userId: authUser }, include: { post: true } });
        res.status(200).json(userSavedPost);
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}));
exports.default = router;
