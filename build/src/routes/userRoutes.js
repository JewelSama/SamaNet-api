"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// @ts-ignore
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SibClient = sib_api_v3_sdk_1.default.ApiClient.instance;
SibClient.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const transactionEmailApi = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
let smtpMailData = new sib_api_v3_sdk_1.default.SendSmtpEmail();
const sender = {
    email: 'osafilejewel@gmail.com',
    name: 'SamaNet',
};
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "JWT SECRET";
const EMAIL_TOKEN_EXPIRATION_TIME = 10;
const AUTHENTICATION_EXPIRATION_HOURS = 720; //720hrs i.e 30days
// Gen jwt token
function generateAuthToken(id) {
    const jwtpayload = { id };
    return jsonwebtoken_1.default.sign(jwtpayload, JWT_SECRET, {
        algorithm: 'HS256',
        noTimestamp: true,
        expiresIn: '30d'
    });
}
// register
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, firstname, lastname, password } = req.body;
    if (!(username && email && firstname && lastname && password)) {
        return res.status(400).json({ error: "All inputs are required" });
    }
    // console.log(req.body)
    const attemptedUser = yield prisma.user.findUnique({ where: { email: email } });
    const attemptedUserId = attemptedUser === null || attemptedUser === void 0 ? void 0 : attemptedUser.id;
    const invalidUsername = yield prisma.user.findUnique({ where: { username: username } });
    if ((attemptedUser === null || attemptedUser === void 0 ? void 0 : attemptedUser.isVerified) === true) {
        return res.status(409).json({ error: "User Already Exist.. Please Login" });
    }
    if (attemptedUser && ((attemptedUser === null || attemptedUser === void 0 ? void 0 : attemptedUser.isVerified) === false)) {
        return res.status(200).json({ validate: "Account already created.. Please verify email Token", attemptedUserId });
    }
    if (invalidUsername) {
        return res.status(409).json({ error: "Username is not available!" });
    }
    const encryptedPassword = yield bcryptjs_1.default.hash(password, 10);
    // Generate a random 8 digit number as the email token
    function generateToken() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // console.log(encryptedPassword) 
    /*  try {
         
      } catch (error) {
          console.log(error)
      } */
    const emailToken = generateToken();
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_TIME * 60 * 1000); // *60---to secs *1000 --milliseconds
    try {
        const newUser = yield prisma.user.create({
            data: {
                username,
                email: email.toLowerCase(),
                firstname,
                lastname,
                password: encryptedPassword
            },
            include: { tokens: true }
        });
        // console.log(JWT_SECRET)
        const createdEmailToken = yield prisma.s_EmailToken.create({
            data: {
                emailToken,
                valid: true,
                expiration,
                user: {
                    connect: {
                        email
                    }
                }
            },
            include: {
                user: {
                    select: { email: true, id: true }
                }
            }
        });
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
        yield transactionEmailApi.sendTransacEmail(smtpMailData)
            // @ts-ignore
            .then((data) => {
            console.log(data); // log the email id
        })
            // @ts-ignore
            .catch((error) => {
            console.error(error);
            throw new Error(error); // handle errors
        });
        // res.sendStatus(200)
        res.status(201).json(createdEmailToken);
    }
    catch (error) {
        console.log('An error occured...');
        console.error(error);
        // @ts-ignore
        throw new Error(error); // handle errors
    }
}));
//Validate EmailToken and then create AuthToken 
router.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, emailToken } = req.body;
    try {
        const dbEmailToken = yield prisma.s_EmailToken.findUnique({
            where: { emailToken },
            include: { user: true }
        });
        // console.log(dbEmailToken)
        if (!dbEmailToken || !dbEmailToken.valid) {
            return res.sendStatus(401); //unauthenticated
        }
        if (dbEmailToken === null || dbEmailToken === void 0 ? void 0 : dbEmailToken.expiration) {
            if ((dbEmailToken === null || dbEmailToken === void 0 ? void 0 : dbEmailToken.expiration) < new Date()) {
                return res.status(401).json({ error: "Token expired!" });
            }
        }
        else {
        }
        if (((_a = dbEmailToken === null || dbEmailToken === void 0 ? void 0 : dbEmailToken.user) === null || _a === void 0 ? void 0 : _a.email) !== email) {
            return res.sendStatus(401);
        }
        // make user verified
        yield prisma.user.update({
            where: {
                email: dbEmailToken === null || dbEmailToken === void 0 ? void 0 : dbEmailToken.user.email
            },
            data: {
                isVerified: true
            }
        });
        // generate  AuthToken 
        const authTokenExpiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000); //to milliseconds
        // const user = await prisma.user.update({
        //     where: { email },
        //     data: {
        //         authToken: generateAuthToken(),
        //         tokenExpiration: authTokenExpiration,
        //     },
        // }) 
        // console.log(token)
        const user = yield prisma.user.findUnique({ where: { email } });
        if (user) {
            const authToken = generateAuthToken(user.id);
            const userWithToken = yield prisma.user.update({
                where: { id: user.id },
                data: {
                    authToken,
                    tokenExpiration: authTokenExpiration
                },
            });
            // console.log(user)
            // console.log(userWithToken)
            res.status(200).json(userWithToken);
        }
    }
    catch (error) {
        console.log(error);
        // process.exit(1)
    }
}));
//resend emailToken and send to users email
// router.put('/authenticate/resend/:id', async(req, res) => {
router.put('/authenticate/resend', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    function generateToken() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    const emailToken = generateToken();
    // console.log(emailToken)
    const expiration = new Date(new Date().getTime() + EMAIL_TOKEN_EXPIRATION_TIME * 60 * 1000); // *60---to secs *1000 --milliseconds
    // const { id  } = req.params;
    const { email } = req.body;
    const Reuser = yield prisma.user.findUnique({
        where: { email: email },
        include: { tokens: true }
    });
    const TokenId = Reuser === null || Reuser === void 0 ? void 0 : Reuser.tokens[0].id;
    // console.log(TokenId)
    try {
        const newToken = yield prisma.s_EmailToken.update({
            where: { id: Number(TokenId) },
            data: {
                emailToken,
                expiration
            },
            include: { user: true }
        });
        // console.log(newToken?.user?.email)
        smtpMailData.sender = sender;
        smtpMailData.to = [{
                email: (_b = newToken === null || newToken === void 0 ? void 0 : newToken.user) === null || _b === void 0 ? void 0 : _b.email,
                name: (_c = newToken === null || newToken === void 0 ? void 0 : newToken.user) === null || _c === void 0 ? void 0 : _c.firstname
            }];
        smtpMailData.subject = 'SamaNet email verification code';
        smtpMailData.params = {
            'name': (_d = newToken === null || newToken === void 0 ? void 0 : newToken.user) === null || _d === void 0 ? void 0 : _d.firstname,
            'token': newToken === null || newToken === void 0 ? void 0 : newToken.emailToken
        };
        smtpMailData.htmlContent = "<html><body><p>Hello {{ params.name }}, "
            + "welcome to SamaNet. We'll notify you "
            + "Your new email verification code is {{ params.token }}."
            + " arigato!</p></body></html>";
        // send email
        yield transactionEmailApi.sendTransacEmail(smtpMailData)
            // @ts-ignore
            .then((data) => {
            console.log(data); // log the email id
        })
            // @ts-ignore
            .catch((error) => {
            console.error(error);
            throw new Error(error); // handle errors
        });
        res.status(200).json(newToken);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "Email could not be sent" });
        process.exit(1);
    }
}));
//Login User
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All inputs are required" });
    }
    const user = yield prisma.user.findUnique({
        where: { email },
    });
    const authTokenExpiration = new Date(new Date().getTime() + AUTHENTICATION_EXPIRATION_HOURS * 60 * 60 * 1000); //to milliseconds
    if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
        const authToken = generateAuthToken(user.id);
        const userWithNewToken = yield prisma.user.update({
            where: { id: user.id },
            data: {
                authToken,
                tokenExpiration: authTokenExpiration,
            },
        });
        res.status(200).json(userWithNewToken);
        console.log(userWithNewToken);
    }
    else {
        res.status(400).json({ error: "Invalid login details" });
    }
}));
// @GET Get single User
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: Number(id) },
            include: { posts: true, comments: true, likes: true }
        });
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ error: "User not found!" });
        }
    }
    catch (error) {
        console.log(error);
    }
}));
//@GET GET user/users by [name]
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    try {
        const foundUsers = yield prisma.user.findMany({
            where: {
                OR: [{ username: { contains: String(name) } }, { firstname: { contains: String(name) } }]
            },
            select: {
                id: true,
                username: true,
                display_pic: true
            }
        });
        if (!foundUsers) {
            return res.sendStatus(404);
        }
        else {
            console.log(foundUsers);
            return res.status(200).json(foundUsers);
        }
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Something went wrong" });
    }
}));
//Delete User
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.user.delete({
            where: { id: Number(id) }
        });
        res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ error: "User could not be deleted!" });
    }
}));
exports.default = router;
