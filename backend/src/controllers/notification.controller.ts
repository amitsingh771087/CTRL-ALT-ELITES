import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Notification } from '../models/Notification';

/** GET /notifications — the "New matching scheme notification" feed. */
export const listNotifications = catchAsync(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('scheme', 'title level sourceAuthority');

  res.status(200).json({ success: true, notifications });
});

/** PATCH /notifications/:id/read */
export const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  await Notification.updateOne(
    { _id: req.params.id, user: req.userId },
    { $set: { isRead: true } }
  );
  res.status(200).json({ success: true });
});
