import express from "express"
const authRouter = express.Router()
import {validateRegister, validateLogin} from "../middlewares/auth.validator.js"
import authController from "../controllers/auth.controller.js"

authRouter.post("/register",validateRegister , authController.registerController)




export default authRouter