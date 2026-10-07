import { Schema, model, Document, Types } from 'mongoose';

/**
 * "New matching scheme" notifications (see flowchart: Scheme Sync ->
 * new match goes live -> notify user). Kept simple: a feed per user,
 * marked read/unread. Push delivery is out of scope for this scaffold —
 * wire this up to FCM/APNs in notification.service.ts.
 */
export interface INotification extends Document {
  user: Types.ObjectId;
  scheme: Types.ObjectId;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheme: { type: Schema.Types.ObjectId, ref: 'Scheme', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = model<INotification>('Notification', notificationSchema);
