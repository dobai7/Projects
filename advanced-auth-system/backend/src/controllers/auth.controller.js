import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs"
import tokenModel from "../models/token.model.js"
import { createAccessToken, createRefreshToken } from "../services/token.service.js";

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
        username, email, password: hash
    })

    const accessToken = createAccessToken(user)

    const refreshToken = createRefreshToken(user)

    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
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

    const user = await userModel.findOne({ username })

    if (!user) {
        return res.status(401).json({
            message: "user not found"
        })
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password)

    if (!isCorrectPassword) {
        return res.status(401).json({
            message: "incorrect password"
        })
    }

    const accessToken = createAccessToken(user)

    const refreshToken = createRefreshToken(user)

    const tokenUser = await tokenModel.create({
        userId: user._id,
        token: refreshToken,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.jwt_secret)


    const token = await tokenModel.findOne({
        userId: decoded.userId,
        token: refreshToken
    })

    if (!token) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const user = await userModel.findById(decoded.userId)

    if (!user) {
        return res.status(401).json({
            message: "user not found"
        })
    }

    if (token.isRevoked) {
        return res.status(401).json({
            message: "refresh token is revoked"
        })
    }

    if (token.expiresAt < new Date()) {
        return res.status(401).json({
            message: "refresh token is expired"
        })
    }

    const accessToken = createAccessToken(user)

    const newRefreshToken = createRefreshToken(user)

    token.token = newRefreshToken
    token.userAgent = req.headers["user-agent"]
    token.ipAddress = req.ip
    token.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await token.save()

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
        message: "access token refreshed successfully",
        accessToken
    })
}

const logoutController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.jwt_secret)

    const token = await tokenModel.findOne({
        userId: decoded.userId,
        token: refreshToken
    })

    if (!token) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    if (token.isRevoked) {
        return res.status(401).json({
            message: "refresh token is revoked"
        })
    }


    token.isRevoked = true
    await token.save()

    res.clearCookie("refreshToken",{
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    })

    res.status(200).json({
        message: "user logged out successfully"
    })
}

const logoutAllController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.jwt_secret)

    const token = await tokenModel.findOne({
        userId: decoded.userId,
        token: refreshToken
    })

    if (!token) {
        return res.status(401).json({
            message: "refresh token not found"
        })
    }

    if (token.isRevoked) {
        return res.status(401).json({
            message: "refresh token is revoked"
        })
    }

    const userId = decoded.userId;

    await tokenModel.updateMany({
        userId: userId,
        isRevoked: false
    }, {
        isRevoked: true
    })  

    res.clearCookie("refreshToken",{
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    })

    res.status(200).json({
        message: "user logged out from all devices successfully"
    })
}


export default {
    registerController,
    loginController,
    refreshTokenController
}