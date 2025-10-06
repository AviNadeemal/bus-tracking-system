import mongoose from 'mongoose';
const { Schema } = mongoose;

const RouteSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String },
  description: String,
  stops: [{ type: Schema.Types.ObjectId, ref: 'Stop' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Route', RouteSchema);