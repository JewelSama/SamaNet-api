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
}).single('display_pic') 


//Edit photo
router.put('/update', async(req, res) => {
    
    upload(req, res, async(err)  => {
        if(err){
            console.log(err)
           return res.sendStatus(400)
        } else {
            const samaImg = req.file;
            //@ts-ignore
            const user = req.user;

            
             if(!samaImg){
                return res.status(400).json({ error: "Upload Image" })
            }
            try {
                const updatedUser = await prisma.user.update({
                    where: {id: user.id},
                    data: {
                        display_pic: samaImg?.path
                    }
                })
                if(!updatedUser){
                    res.status(404).json({ error: "Post does not exist" })
                }
                res.status(200).json(updatedUser)
            } catch (error) {
                console.log(error)
                return res.status(400).json({ error: "Something went wrong" })
            }

    }})





})










export default router;