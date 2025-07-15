import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IBerita extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
  published: boolean;
  views: number;
}

const BeritaSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image_url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    published: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Auto-generate slug from title before saving
BeritaSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title as string, {
      lower: true,
      strict: true,
      locale: 'id',
    });
  }
  next();
});

// Prevent re-compilation during development
export default mongoose.models.Berita || mongoose.model<IBerita>('Berita', BeritaSchema);