import { Router } from "express";


const router = Router()

//create Post
router.post('/', async(req, res) => {
    try {
        res.send("halahshxvvskjb")
    } catch (error) {
        console.log(error)
    }
})



export default router;