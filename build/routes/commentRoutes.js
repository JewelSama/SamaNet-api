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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
//@POST create comment on a post
router.post('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { caption } = req.body;
    const { id } = req.params;
    if (!caption) {
        return res.status(400).json({ error: "Comment cannot be empty" });
    }
    try {
        const post = yield prisma.post.findUnique({ where: { id: Number(id) } });
        // @ts-ignore 
        const user = req.user;
        // console.log(req.user)
        // console.log(caption)
        if (post) {
            try {
                const comment = yield prisma.comment.create({
                    data: {
                        caption,
                        userId: user.id,
                        postId: post.id,
                    },
                    include: {
                        user: true
                    }
                });
                res.status(201).json(comment);
            }
            catch (error) {
                console.log(error);
                res.sendStatus(400);
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Something went wrong" });
    }
}));
//@DELETE PRIVATE
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore 
    const user = req.user;
    const { id } = req.params;
    try {
        const comment = yield prisma.comment.findUnique({
            where: { id: Number(id) }
        });
        if (comment) {
            // console.log(comment)
            if (comment.userId !== user.id) {
                return res.status(400).json({ error: "You can't delete this comment!" });
            }
            else {
                yield prisma.comment.delete({
                    where: { id: Number(id) }
                });
                res.sendStatus(200);
            }
        }
        else {
            res.sendStatus(404);
        }
    }
    catch (error) {
        res.status(400).json({ error: "Something went wrong" });
    }
}));
exports.default = router;
