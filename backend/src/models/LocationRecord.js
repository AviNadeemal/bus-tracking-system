import mongoose from 'mongoose';
const { Schema } = mongoose;

const LocationRecordSchema = new Schema({
  bus: { type: Schema.Types.ObjectId, ref: 'Bus' },
  route: { type: Schema.Types.ObjectId, ref: 'Route' },
  trip: { type: Schema.Types.ObjectId, ref: 'Trip' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  speed: Number,
  heading: Number,
  recordedAt: { type: Date, default: Date.now }
});

// Indices for efficient location and time-based history lookups
LocationRecordSchema.index({ location: '2dsphere' });
LocationRecordSchema.index({ recordedAt: 1 });

export default mongoose.model('LocationRecord', LocationRecordSchema);