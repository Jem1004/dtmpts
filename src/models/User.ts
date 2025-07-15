import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password_hash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [50, 'Username cannot exceed 50 characters'],
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['admin', 'super_admin'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);