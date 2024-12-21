import e from "express";

import { AuthController } from "../controllers/auth.controller.js";

export const authRouter = e.Router()

const auth = new AuthController()

authRouter.post('/register', auth.register)
authRouter.post('/login', auth.login)
