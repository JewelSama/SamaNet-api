import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
// @ts-ignore
import SibApi from "sib-api-v3-sdk"
import jwt from "jsonwebtoken"





const SibClient = SibApi.ApiClient.instance;

SibClient.authentications['api-key'].apiKey = process.env.SIB_API_KEY

const transactionEmailApi = new SibApi.TransactionalEmailsApi();

let smtpMailData = new SibApi.SendSmtpEmail();


const sender = {
    email: 'osafilejewel@gmail.com', // your email address
    name: 'SamaNet',
  };

const router = Router()
const prisma = new PrismaClient()


const JWT_SECRET = process.env.JWT_SECRET || "JWT SECRET";

const EMAIL_TOKEN_EXPIRATION_TIME = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 720; //720hrs i.e 30days


    // Gen jwt token

    function generateAuthToken(id: number): string {
        const jwtpayload = { id };

        return jwt.sign(jwtpayload, JWT_SECRET, {
            algorithm: 'HS256',
            noTimestamp: true,
            expiresIn: '30d'
        })
    }







// register
router.post('/register', async(req, res) => {
    const { username, email, firstname, lastname, password } = req.body

    if(!(username && email && firstname && lastname && password)){
        return res.status(400).json({ error: "All inputes are required" })
    }
    // console.log(req.body)
    const attemptedUser = await prisma.user.findUnique({ where: { email: email } })  
    
    const invalidUsername = await prisma.user.findUnique({ where: { username: username  }}) 

    if(attemptedUser){
        return res.status(409).json({ error: "User Already Exist. Please Login" })
    }

    if(invalidUsername){
        return res.status(409).json({ error: "Username is not available!" })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    // Generate a random 8 digit number as the email token
function generateToken(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

    // console.log(encryptedPassword) 
  /*  try {
       
    } catch (error) {
        console.log(error)
    } */

    const emailToken = generateToken()

    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_TIME * 60 * 1000) // *60---to secs *1000 --milliseconds

    try {

        const newUser = await prisma.user.create({
            data: {
                username,
                email: email.toLowerCase(),
                firstname,
                lastname,
                password: encryptedPassword
            },
            include: {tokens: true}
        }) 
        // console.log(JWT_SECRET)






    const createdEmailToken = await prisma.s_EmailToken.create({
        data: {
            emailToken,
            valid: true,
            expiration,
            user: {
                connect: {
                    email
                }
            }
        }
    }) 
    // console.log(expiration)
    // console.log(createdEmailToken)


        smtpMailData.sender = sender;

       smtpMailData.to = [{
            email: email,
            name: firstname
        }];

       smtpMailData.subject = 'SamaNet email verification code';

       smtpMailData.params = {
            'name': firstname,
            'token': emailToken
        };

       smtpMailData.htmlContent = "<html><body><p>Hi {{ params.name }}, "
                  + "Your email verification code is {{ params.token }}. "
                 + "arigato!</p></body></html>";

        // send email
        await transactionEmailApi.sendTransacEmail(smtpMailData)
        // @ts-ignore
            .then((data) => { 
                console.log(data) // log the email id
            })
            // @ts-ignore
            .catch((error) => {
                console.error(error)
                throw new Error(error) // handle errors
            })
    // res.sendStatus(200)
    res.status(201).json(createdEmailToken)


    } catch (error) {
        console.log('An error occured...')
        console.error(error)
        // @ts-ignore
        throw new Error(error) // handle errors
    }


    
    
    




})

//Validate EmailToken and then create AuthToken 
router.post('/authenticate', async (req, res) => {
    const { email, emailToken } = req.body;

    try {
        const dbEmailToken = await prisma.s_EmailToken.findUnique({
            where: {emailToken},
            include: {user: true}  
        })
    
        // console.log(dbEmailToken)

        if(!dbEmailToken || !dbEmailToken.valid){
            return res.sendStatus(401); //unauthenticated
        }

        if(dbEmailToken?.expiration){
            if(dbEmailToken?.expiration < new Date()){
                return res.status(401).json({ error: "Token expired!" })
            }
        } else {

        }

        if(dbEmailToken?.user?.email !== email){

            return res.sendStatus(401);
        }

        // make user verified

        await prisma.user.update({
            where: {
                email: dbEmailToken?.user.email
            },
            data: {
                isVerified: true
            }
        })

        // generate  AuthToken 
        const authTokenExpiration = new Date( new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000  ) //to milliseconds
        
        
        // const user = await prisma.user.update({
        //     where: { email },
        //     data: {
        //         authToken: generateAuthToken(),
        //         tokenExpiration: authTokenExpiration,
        //     },
        // }) 
        // console.log(token)

        const user = await prisma.user.findUnique({ where: {email} })
        if(user){
            const authToken = generateAuthToken(user.id)
            const userWithToken = await prisma.user.update({
                where: {id: user.id},
                data: {
                    authToken,
                    tokenExpiration: authTokenExpiration
                },
            })
            // console.log(user)
            // console.log(userWithToken)
            res.status(200).json(userWithToken)

        }

    } catch (error) {
        console.log(error)
        // process.exit(1)
    }
})

//resend emailToken and send to users email

router.put('/authenticate/resend/:id', async(req, res) => {
    function generateToken(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const emailToken = generateToken()
    console.log(emailToken)
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_TIME * 60 * 1000) // *60---to secs *1000 --milliseconds

    const { id  } = req.params;

    try {
        const newToken = await prisma.s_EmailToken.update({
            where: {id: Number(id)},
            data: {
                emailToken,
                expiration
            },
            include: {user: true}
        })

        // console.log(newToken?.user?.email)


        smtpMailData.sender = sender;

       smtpMailData.to = [{
            email: newToken?.user?.email,
            name: newToken?.user?.firstname
        }];

       smtpMailData.subject = 'SamaNet email verification code';

       smtpMailData.params = {
            'name': newToken?.user?.firstname,
            'token': newToken?.emailToken
        };

       smtpMailData.htmlContent = "<html><body><p>Hello {{ params.name }}, "
                 + "welcome to SamaNet. We'll notify you "
                  + "Your new email verification code is {{ params.token }}."
                 + " arigato!</p></body></html>";

        // send email
        await transactionEmailApi.sendTransacEmail(smtpMailData)
        // @ts-ignore
            .then((data) => { 
                console.log(data) // log the email id
            })
            // @ts-ignore
            .catch((error) => {
                console.error(error)
                throw new Error(error) // handle errors
            })

        res.status(200).json(newToken)
        
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: "Email could not be sent" })
        process.exit(1)
    }
})

//Login User
router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ error: "All inputs are required" })
    }
    const user = await prisma.user.findUnique({
        where: {email},
    })
    
    const authTokenExpiration = new Date( new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000  ) //to milliseconds

    if(user && (await bcrypt.compare(password, user.password))){
        const authToken = generateAuthToken(user.id)
        const userWithNewToken = await prisma.user.update({
            where: { id: user.id },
            data: {
                authToken,
                tokenExpiration: authTokenExpiration,
            },
        })
        res.status(200).json(userWithNewToken)
        console.log(userWithNewToken)
    } 
    else {
        res.status(400).json({error: "Invalid login details"})
    }

})

// @GET Get single User
router.get('/:id', async(req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({ 
            where: {id: Number(id)},
            include: {posts: true, comments: true, likes: true} 
        })
        
        if(user){
            res.status(200).json(user)
        } else {
            res.status(404).json({ error: "User not found!" })
        }
    } catch (error) {
        console.log(error)
    }
})


//@GET GET user/users by [name]

router.get('/', async (req, res) => {
    const { name } = req.query
    try {
        const foundUsers = await prisma.user.findMany({
            where: {
                OR: [{ username: { contains: String(name) }}, { firstname: {contains: String(name)} }]
            }
        })

        console.log(foundUsers)
        res.status(200).json(foundUsers)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "Something went wrong" })
    }
})








//Delete User

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

   try {
    await prisma.user.delete({
        where: {id: Number(id)}
    })
    res.sendStatus(200);
   } catch (error) {
    console.log(error)
    res.status(401).json({ error: "User could not be deleted!" })
   }
})




export default router;
