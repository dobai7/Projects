import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs"
import config from "../config/index.js"
import tokenModel from "../models/token.model.js"
import jwt from "jsonwebtoken"

const registerController = async (req, res) => {
    const { username, email, password } = req.body;

    const userExist = await userModel.findOne({
        $or: [
            { username },
            { email }
        ]
    });

    if (userExist) {
        return res.status(400).json({
            message: "user already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,email,password:hash
    })

    const accessToken = jwt.sign(
        {
            id : user._id,
        },
        config.jwt_secret,
        {
            expiresIn: "15m"
        }
    )

    const refreshToken = jwt.sign(
        {
            id: user._id
        },
        config.jwt_secret,
        {
            expiresIn: "7d"
        }
    )

    const expiresAt = new Date(
        Date.now() + 7*24*60*60*1000
    )

    await tokenModel.create({
        userId: user._id,
        token: refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: expiresAt
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
        message: "user registered successfully",
        username: user.username, email: user.email,
        accessToken,
        refreshToken
    })

}


const loginController = async (req, res) => {
    const { username, password } = req.body;

    const user = await userModel.findOne({username})

    if(!user){
        return res.status(401).json({
            message:"user not found"
        })
    }

    const isCorrectPassword = await bcrypt.compare(password , user.password)
    
    if(!isCorrectPassword){
        return res.status(401).json({
            message:"incorrect password"
        })
    }

    const accessToken = jwt.sign(
        {
            id : user._id,
        },
        config.jwt_secret,
        {
            expiresIn: "15m"
        }
    )

    const refreshToken = jwt.sign(
        {
            id: user._id
        },
        config.jwt_secret,
        {
            expiresIn: "7d"
        }
    )

    const tokenUser = await tokenModel.create({
        userId: user._id,
        token: refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000)
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "user logged in successfully",
        username: user.username, email: user.email,
        accessToken,
        refreshToken
    })
    
}

export default {
    registerController,
    loginController
}