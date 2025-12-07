import mongoose, { Schema, Document } from 'mongoose';

export interface IApp extends Document {
  name: string;
  description: string;
  category: string;
  icon: string;
  code: string;
  creator: string;
  tokenAddress?: string;
  downloads: number;
  createdAt: Date;
  updatedAt: Date;
}

const AppSchema = new Schema<IApp>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: '📱' },
  code: { type: String, required: true },
  creator: { type: String, required: true },
  tokenAddress: { type: String },
  downloads: { type: Number, default: 0 },
}, {
  timestamps: true,
});

export default mongoose.models.App || mongoose.model<IApp>('App', AppSchema);

