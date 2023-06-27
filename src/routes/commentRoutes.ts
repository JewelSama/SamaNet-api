import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router()
const prisma = new PrismaClient()

//@POST create comment on a post
router.post('/:id', async(req, res) => {
    const { caption } = req.body
    const { id } = req.params;
    if(!caption){
        return res.status(400).json({ error: "Comment cannot be empty" })
    }

    
    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } })
        // @ts-ignore 
        const user = req.user;
        // console.log(req.user)
        // console.log(caption)
        if(post){
            try {
                const comment = await prisma.comment.create({
                    data: {
                        caption,
                        userId: user.id,
                        postId: post.id,
                    },
                    include: {
                        user: true
                    }
                })
                res.status(201).json(comment)
            } catch (error) {
                console.log(error)
                res.sendStatus(400)
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Something went wrong" })
    }
})

//@DELETE PRIVATE
router.delete('/:id', async(req, res) => {
        // @ts-ignore 
        const user = req.user
        const { id } = req.params;
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) }
        })
        if(comment){
            // console.log(comment)
            if(comment.userId !== user.id){
                return res.status(400).json({ error: "You can't delete this comment!" })
            } else {
                await prisma.comment.delete({
                    where: { id: Number(id) }
                })
                res.sendStatus(200)
            }

        } else {
            res.sendStatus(404)
        }

    } catch (error) {
        res.status(400).json({ error: "Something went wrong" })
    }
})




export default router;
















