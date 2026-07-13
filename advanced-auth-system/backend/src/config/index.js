import dotenv from 'dotenv';
dotenv.config();

const config = {
  MONGO_URI: process.env.MONGO_URI ,
  jwt_secret: process.env.JWT_SECRET
}

export default config;