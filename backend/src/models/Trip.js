import mongoose from 'mongoose';
const { Schema } = mongoose;

const TripSchema = new Schema({
  route: { type: Schema.Types.ObjectId, ref: 'Route' },
  bus: { type: Schema.Types.ObjectId, ref: 'Bus' },
  date: Date,
  startTime: Date,
  endTime: Date,
  status: { type: String, enum: ['scheduled','running','completed','cancelled'], default: 'scheduled' }
});

export default mongoose.model('Trip', TripSchema);