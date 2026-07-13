import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type:mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  token:{
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  isRevoked:{
    type: Boolean,
    default: false  
  },
  expiresAt: {
    type: Date,
    required: true,
  }
},{
  timestamps: true
})

const tokenModel = mongoose.model("tokens", tokenSchema);

export default tokenModel;