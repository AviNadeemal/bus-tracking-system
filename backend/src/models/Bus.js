import mongoose from 'mongoose';
const { Schema } = mongoose;

const BusSchema = new Schema({
  regNo: { type: String, required: true },
  capacity: Number,
  operator: String,
  currentRoute: { type: Schema.Types.ObjectId, ref: 'Route' },
  currentTrip: { type: Schema.Types.ObjectId, ref: 'Trip' },
  lastSeenAt: Date,
  lastLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }
});

// Index for finding nearby buses
BusSchema.index({ lastLocation: '2dsphere' });

export default mongoose.model('Bus', BusSchema);