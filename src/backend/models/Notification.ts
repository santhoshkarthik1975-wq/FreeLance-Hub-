import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  readDate?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    resourceType: { type: String },
    resourceId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
  }
);

export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
