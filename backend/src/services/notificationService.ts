import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Broadcast from '../models/Broadcast.js';
import nodemailer from 'nodemailer';

export const resolveAudience = async (criteria: any) => {
  const query: any = {};
  
  if (criteria.roles?.length) query.role = { $in: criteria.roles };
  if (criteria.departments?.length) query.department = { $in: criteria.departments };
  if (criteria.batches?.length) query.batch = { $in: criteria.batches };
  
  const users = await User.find(query).select('_id email');
  return users;
};

export const dispatchBroadcast = async (broadcastId: string) => {
  const broadcast = await Broadcast.findById(broadcastId);
  if (!broadcast) return;

  const audience = await resolveAudience(broadcast.targetAudience);
  
  // 1. In-App Notifications
  if (broadcast.channels.includes('in-app')) {
    const notifications = audience.map(user => ({
      recipient: user._id,
      broadcast: broadcast._id,
      title: broadcast.title,
      content: broadcast.content
    }));
    await Notification.insertMany(notifications);
  }

  // 2. Email (SMTP)
  if (broadcast.channels.includes('email')) {
    // Placeholder for SMTP logic
    // const transporter = nodemailer.createTransport(...)
    console.log(`Dispatched ${audience.length} emails for broadcast: ${broadcast.title}`);
  }

  broadcast.status = 'Sent';
  broadcast.stats.targetCount = audience.length;
  await broadcast.save();
};
