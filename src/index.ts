import express from "express"
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes"
import postRoutes from "./routes/postRoutes"
import { authenticateToken } from "./middlewares/authMiddleware"



dotenv.config()
const app = express()
app.use(express.static('../public'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())


const port = process.env.Port 

app.use('/user', userRoutes);
app.use('/post', authenticateToken, postRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to SamaNet');
})










app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})