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


router.post('/like/:id', async(req, res) => {
    const { id } = req.params;
    //@ts-ignore
    const user = req.user

    const post = await prisma.post.findUnique({ where: {id: Number(id)}, include: {likes: true} })
    // @ts-ignore 
    const likes = await prisma.like.findMany({ where: { postId: post?.id }, select: {userId: true} })

    // console.log(likes)
    const userLikes = likes.map((like) => like.userId)

    const hasLikes = userLikes.includes(user.id)
    // console.log(hasLikes)

    
    if(post){
        try {
            if(hasLikes){
                return res.sendStatus(400)
            }
            const likedPost = await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: post?.id,
                }, 
                include: { user: {
                    select: {
                        id: true,
                        firstname: true,
                        lastname: true,
                        display_pic: true,
                    }
                } }
            })

            res.status(201).json(likedPost)
    
        } catch (error) {
            console.log(error)
            res.sendStatus(400)
        }

    }

})
//@DELETE unlike posts
// sending like id

router.delete('/like/:id', async(req, res) => {
    const { id } = req.params;
    // @ts-ignore  
    const user = req.user;

    try {
        const like = await prisma.like.findUnique({ where: {id: Number(id)} })

        if(like){
            if(like.userId !== user.id){
                return res.sendStatus(400)
            } else {
                await prisma.like.delete({ where: { id: Number(id) } })
                return res.sendStatus(200)
            }
        } else {
            return res.sendStatus(404)
        }


    } catch (error) {
        console.log(error)
        res.sendStatus(400)
    }
})


//@POST Save Post

router.post('/save/:id', async(req, res) => {
    const { id } = req.params;
    //@ts-ignore
    const user = req.user;
    // console.log(user)

    const post = await prisma.post.findUnique({ where: { id: Number(id) }, include: { savedposts: true } })
    if(!post){
        return res.sendStatus(404)
    }
    // console.log(post)
    const savedPostss = post.savedposts;
    const saved = savedPostss.map((save) => save.userId)

    const alreadySaved = saved.includes(user.id)
    // console.log(alreadySaved)
    try {
        if(alreadySaved){
            return res.status(400).json({ error: "Post already Saved" })
        }
        const newSavedPost = await prisma.savedpost.create({
            data: {
                userId: user.id,
                postId: post.id,
            },
            include: {post: true}
        })
        // console.log(newSavedPost)
        res.status(200).json(newSavedPost)
    } catch (error) {
        console.log(error)
       return  res.status(400).json({ errror: "Something happened" })
    }

})

//@DELETE removed posts from saved

router.delete('/save/:id', async(req, res) => {
    const { id } = req.params; //SavePost id
    //@ts-ignore
    const user = req.user;

    try {
        const savedPost = await prisma.savedpost.findUnique({ where: { id: Number(id) } })
        // console.log(savedPost?.userId, user.id)
        if(savedPost?.userId !== user.id){
            return res.status(200).json({ error: "Something went wrong" })
        }

        await prisma.savedpost.delete({ where: { id: Number(id) } })
        res.sendStatus(200)
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Something went wrong!" })
    }
})

//@GET users saved posts

router.get('/save', async(req, res) => {
    // const { id } = req.params; //user id
    // @ts-ignore
    const authUser = req?.user?.id;
    try {
        const userSavedPost = await prisma.savedpost.findMany({ where: { userId: authUser }, include: { post: true } })
        res.status(200).json(userSavedPost)
    } catch (error) {
    console.log(error)
    res.status(400).json({ error: "Something went wrong" })        
    }
    
})




export default router;