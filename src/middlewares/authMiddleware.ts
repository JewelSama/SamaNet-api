import {Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import { PrismaClient, User } from "@prisma/client"

const JWT_SECRET = process.env.JWT_SECRET || "Super Secret"

const prisma = new PrismaClient()

type AuthRequest = Request & { user?: User }





export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction){
    const authHeader = req.headers['authorization']

    // split Bearer from the full token to get only token
    const jwtToken = authHeader?.split(" ")[1];
    // console.log(jwtToken)

    if(!jwtToken){
        return res.sendStatus(401)
    }

    //Decode jwt
    // const dbToken = await prisma.user.findUnique({

    try {
        const payload = await jwt.verify(jwtToken, JWT_SECRET) as {
            id: number,
            // email: string
        };
        // console.log(payload)

        const dbToken = await prisma.user.findUnique({
            where: {id: payload.id},
            // include: {authTokens: true}
        })
        // console.log(dbToken)
        if(!dbToken){
            return res.status(401).json({ error: "Auth token is not valid" })
        }

        if(dbToken.tokenExpiration){
            if(dbToken.tokenExpiration < new Date()){
                return res.status(401).json({ error: "Auth token is not valid" })
            }
        }

        // console.log(dbToken)

        req.user = dbToken;

    } catch (error) {
        console.log(error)
        return res.sendStatus(400)
    }
    next()
} 