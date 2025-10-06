import mongoose from 'mongoose';
const { Schema } = mongoose;

const StopSchema = new Schema({
  route: { type: Schema.Types.ObjectId, ref: 'Route' },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  }
});

// Index for finding stops near a location
StopSchema.index({ location: '2dsphere' });

export default mongoose.model('Stop', StopSchema);