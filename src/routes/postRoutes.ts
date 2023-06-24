import { Router } from "express";


const router = Router()

router.post('/', async(req, res) => {
    try {
        res.send("halahshxvvskjb")
    } catch (error) {
        console.log(error)
    }
})



export default router;