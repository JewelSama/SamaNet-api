import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer"
import path from "path";


const router = Router()
const prisma = new PrismaClient()


const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

const upload =  multer({
    storage: storage,
    limits: {fileSize: 5000000}
}).single('img_path') 



//create Post
router.post('/', async(req, res) => {
    // const { caption } = req.body
    // let samaImg = {};
    upload(req, res, async(err)  => {
        if(err){
            console.log(err)
           return res.sendStatus(400)
        } else {
     
             const samaImg = req.file
             const caption = req.body.caption; 
            // console.log("jewwwllllll")
            // console.log(samaImg)
            
            
            if(!caption && !samaImg){
                return res.status(400).json({ error: "Post cannot be empty" })
            }
            // @ts-ignore
            const user = req.user;
            //  console.log(samaImg?.path)
            try {
                const post = await prisma.post.create({
                    data: {
                        caption,
                        userId: user.id,
                         img_path: samaImg?.path
                    },
                    include: {
                        user: true,
                        likes: true,
                        comments: true,
                        savedposts: true,
                    }
                    
                })
        res.status(201).json(post)
    } catch (error) {
        console.log(error)
    }
}
})
})

// @PUT Edit post
router.put('/:id', async (req, res) => {
    const { id } = req.params;


    upload(req, res, async(err)  => {
        if(err){
            console.log(err)
           return res.sendStatus(400)
        } else {
             const samaImg = req.file
             const  caption = req.body.caption;

             if(!caption && !samaImg){
                return res.status(400).json({ error: "Fill in fields" })
            }

        const post = await prisma.post.update({
            where: {id: Number(id)},
            data: {
                caption,
                img_path: samaImg?.path
            }
        })
        if(!post){
            res.status(404).json({ error: "Post does not exist" })
        }

        res.status(200).json(post)
    }})

}) 

// @DELETE @Private delete Posts

router.delete('/:id', async(req, res) => {
    const { id } = req.params;
    try {
        await prisma.post.delete({
            where: {id: Number(id)}
        })
        res.sendStatus(200)
    } catch (error) {
        res.status(404).json({ error: "Post does not exist" })
    }
})






export default router;