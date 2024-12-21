import User from "../models/user.model.js"
import { generateAccessToken, hashPassword, validatePassword, verifyPassword } from "../utils/auth.utils.js"
import logger from "../utils/logger.js"
import { ErrorResponse } from "../utils/responses.js"



export class AuthController {

    constructor(){
        this.register = this.register.bind(this)
        this.login = this.login.bind(this)
    }

    register = async(req, res, next) =>{
            const {firstName, lastName, email, password, confirmPassword} = req.body
            if(!firstName || !lastName || !email || !password || !confirmPassword){
                return next(new ErrorResponse(`Fields are required`, 404))
            }

            try {

                logger.info(`START: Attempting to create a new User`)
                const exisitingUser = await User.findOne({
                    email : email
                })

                if(exisitingUser){
                    return next(new ErrorResponse(`User already exist, Login!`, 400))
                }

                if(password !== confirmPassword){
                    return next(new ErrorResponse(`Passwords must match`, 400))
                }

                const validPassword = validatePassword(password)

                if(!validPassword){
                    return next(new ErrorResponse(`Password must be at least 8 characters of 1 uppercase and 1 special character`, 400))
                }

                const hashedPassword = await hashPassword(password)

                const newUser = await User.create({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword
                })

                if(!newUser){
                    return next(new ErrorResponse(`Failed to create a new User`, 400))
                }

                logger.info(`END: New User was Successfully created`)

                return res.status(201).json({
                    success: true,
                    message: `New User was successfully created`,
                    newUser
                })

            } catch (error) {
                logger.error(`END: Failed to create a new User : ${error.message}`)
                return next(new ErrorResponse(error.message, 500))
            }

    }

    login = async(req, res, next) =>{

        const {email, password} = req.body
            if(!email || !password){
                return next(new ErrorResponse(`Fields are required`, 404))
            }

        try {
            logger.info(`START: Attempting to Login`)
            const user = await User.findOne({email})
            if(!user){
                return next(new ErrorResponse(`Invalid Credentials!`, 401))
            }
            
            const isPasswordCorrect = await verifyPassword(password, user.password)
            
            if(!isPasswordCorrect){
            
                return next(new ErrorResponse(`Invalid Credentials!`, 401))
            }

            const accessToken = generateAccessToken(user._id)
            
            logger.info(`END: Successfully Logged In!`)
            
    
            return res.status(200).json({
                success: true,
                message:`Logged In successfully`,
                user,
                accessToken
            })

        } catch (error) {
            console.log(error)
            logger.info(`END: Failed to Login: ${error.message}`)
            return next(new ErrorResponse(error.message, 500))
            
        }
    }
}