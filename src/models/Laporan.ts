import mongoose, { Document, Schema } from 'mongoose';

export interface ILaporan extends Document {
  nama: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  created_at: Date;
  updated_at: Date;
}

const LaporanSchema: Schema = new Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama is required'],
      trim: true,
      maxlength: [100, 'Nama cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Prevent re-compilation during development
export default mongoose.models.Laporan || mongoose.model<ILaporan>('Laporan', LaporanSchema);