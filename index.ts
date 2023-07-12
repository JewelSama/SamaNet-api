import express from "express"
import dotenv from "dotenv"
import { authenticateToken } from "./src/middlewares/authMiddleware"
import userRoutes from "./src/routes/userRoutes"
import postRoutes from "./src/routes/postRoutes"
import commentRoutes from "./src/routes/commentRoutes"
import profileRoutes from "./src/routes/profileRoutes"



dotenv.config()
const app = express()
app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


const port = process.env.Port 

app.use('/user', userRoutes);
app.use('/post', authenticateToken, postRoutes);
app.use('/post/comment', authenticateToken, commentRoutes);
app.use('/user/profile', authenticateToken, profileRoutes);

app.get('/', (req, res) => {
    // res.send("<h1>Welcome to SamaNet</h1> <img src='uploads\\display_pic-1687971293810.png'  />")
    res.send("Welcome to SamaNet")
})










app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
