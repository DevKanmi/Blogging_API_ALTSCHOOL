import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import logger from './logger.js'

config()
const {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_LIFETIME } = process.env


export const hashPassword = async(password) => {
        const saltRounds = 10
        return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async(pass1, pass2)=>{
    return await bcrypt.compare(pass1, pass2)
}

export const generateAccessToken = (id) =>{
    return jwt.sign({id}, ACCESS_TOKEN_SECRET,
        {expiresIn: ACCESS_TOKEN_LIFETIME}
    )
}

// export const generateRefreshToken = (id) =>{
//     return jwt.sign({id}, REFRESH_TOKEN_SECRET,
//         {expiresIn: REFRESH_TOKEN_LIFETIME}
//     )
// }

export const validateAccessToken = (token) =>{
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    } catch (error) {
        logger.error(`Invalid Access token: ${error.message}`)
        return false
    }
}

// export const validateRefreshToken = (token) => {
//     try {
//         return jwt.verify(token, REFRESH_TOKEN_SECRET)
//     } catch (error) {
//         logger.error(`Invalid refresh token: ${error.message}`)
//         return false
//     }
// }

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#./*?&])[A-Za-z\d@$!%#./*?&]{8,}$/;
    return passwordRegex.test(password);
}