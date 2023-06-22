import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"
import { createTransport } from "nodemailer";
import { getImpliedNodeFormatForFile } from "typescript";
// @ts-ignore
import SibApi from "sib-api-v3-sdk"

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
            }
        }) 
        // console.log(JWT_SECRET)






    const createdEmailToken = await prisma.token.create({
        data: {
            type: "Email",
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
    console.log(expiration)
    console.log(createdEmailToken)










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

       smtpMailData.htmlContent = "<html><body><p>Hello {{ params.name }}, "
                 + "welcome to SamaNet. We'll notify you "
                  + "Your email verification code is {{ params.token }}."
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
    // res.sendStatus(200)
    res.status(201).json(newUser)


    } catch (error) {
        console.log('An error occured...')
        console.error(error)
        // @ts-ignore
        throw new Error(error) // handle errors
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
