import jwt from "jsonwebtoken"
import config from "../config"

export const createAccessToken = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id
    },
    config.jwt_secret,
    {
      expiresIn: "15m"
    })

    return accessToken
}

export const createRefreshToken = (user)=>{
  const refreshToken = jwt.sign(
    {
      userId: user._id
    },
    config.jwt_secret,
    {
      expiresIn: '7d'
    }
  )

  return refreshToken
}

