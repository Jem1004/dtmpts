import mongoose, { Document, Schema } from 'mongoose';

export interface IGaleri extends Document {
  title: string;
  description: string;
  image_url: string;
  type: 'photo' | 'video';
  created_at: Date;
  updated_at: Date;
  published: boolean;
}

const GaleriSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    type: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Prevent re-compilation during development
export default mongoose.models.Galeri || mongoose.model<IGaleri>('Galeri', GaleriSchema);