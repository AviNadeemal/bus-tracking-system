import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);