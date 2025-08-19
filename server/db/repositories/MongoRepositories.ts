import { Announcement, ChatMessage, SimilarityIndex, type IAnnouncement, type IChatMessage, type ISimilarityIndex } from '../models';

export class AnnouncementRepository {
  static async findByEventId(eventId: string): Promise<IAnnouncement[]> {
    return await Announcement.find({ eventId }).sort({ createdAt: -1 });
  }

  static async create(data: Omit<IAnnouncement, '_id' | 'createdAt'>): Promise<IAnnouncement> {
    const announcement = new Announcement(data);
    return await announcement.save();
  }

  static async findRecent(eventId: string, limit: number = 10): Promise<IAnnouncement[]> {
    return await Announcement.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async deleteById(id: string): Promise<boolean> {
    const result = await Announcement.findByIdAndDelete(id);
    return result !== null;
  }
}

export class ChatMessageRepository {
  static async findByEventId(eventId: string, limit: number = 50): Promise<IChatMessage[]> {
    return await ChatMessage.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async findByTeamId(teamId: string, limit: number = 100): Promise<IChatMessage[]> {
    return await ChatMessage.find({ teamId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async create(data: Omit<IChatMessage, '_id' | 'createdAt'>): Promise<IChatMessage> {
    const message = new ChatMessage(data);
    return await message.save();
  }

  static async findByUser(userId: string, eventId: string): Promise<IChatMessage[]> {
    return await ChatMessage.find({ userId, eventId })
      .sort({ createdAt: -1 });
  }

  static async getEventChatStats(eventId: string): Promise<{ totalMessages: number; uniqueUsers: number }> {
    const [totalMessages, uniqueUsers] = await Promise.all([
      ChatMessage.countDocuments({ eventId }),
      ChatMessage.distinct('userId', { eventId }).then(users => users.length)
    ]);

    return { totalMessages, uniqueUsers };
  }
}

export class SimilarityIndexRepository {
  static async findBySubmissionId(submissionId: string): Promise<ISimilarityIndex | null> {
    return await SimilarityIndex.findOne({ submissionId });
  }

  static async upsert(data: Omit<ISimilarityIndex, '_id' | 'createdAt' | 'updatedAt'>): Promise<ISimilarityIndex> {
    return await SimilarityIndex.findOneAndUpdate(
      { submissionId: data.submissionId },
      data,
      { upsert: true, new: true }
    );
  }

  static async findSimilar(vector: number[], threshold: number = 0.8, limit: number = 10): Promise<ISimilarityIndex[]> {
    // This is a simplified similarity search
    // In production, you'd use MongoDB Atlas Vector Search or a dedicated vector database
    return await SimilarityIndex.find({}).limit(limit);
  }

  static async updateMeta(submissionId: string, meta: Record<string, any>): Promise<ISimilarityIndex | null> {
    return await SimilarityIndex.findOneAndUpdate(
      { submissionId },
      { $set: { meta } },
      { new: true }
    );
  }

  static async deleteBySubmissionId(submissionId: string): Promise<boolean> {
    const result = await SimilarityIndex.findOneAndDelete({ submissionId });
    return result !== null;
  }
}