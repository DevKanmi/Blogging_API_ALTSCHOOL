import { validateAccessToken} from "../utils/auth.utils.js";
import {ErrorResponse} from "../utils/responses.js"

export const Authenticate = (req, res, next) =>{
    const header = req.headers['authorization']
    if(!header){
        return next(new ErrorResponse(`No token was found in Header`, 404))
    }

    
    if(header.startsWith('Bearer ')){
        const token = header.replace('Bearer ','')
    
      
    try{
        const payload = validateAccessToken(token)
    if(!payload){
        return next(new ErrorResponse(`Invalid Token`, 401))
    }

    req.user = {
        id: payload.id,
        
    }

    next()
    } 

    catch(error){
        return next(error)
}
    }
}
