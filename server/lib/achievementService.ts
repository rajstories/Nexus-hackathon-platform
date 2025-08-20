interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'performance' | 'collaboration' | 'innovation' | 'leadership';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (userStats: UserStats) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface UserStats {
  eventsParticipated: number;
  teamsCreated: number;
  submissionsCount: number;
  averageScore: number;
  chatMessagesCount: number;
  helpfulVotes: number;
  winCount: number;
  judgeCount: number;
  organizerCount: number;
  streakDays: number;
  collaborationScore: number;
  innovationRating: number;
}

interface UserAchievements {
  userId: string;
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  achievements: Achievement[];
  recentUnlocks: Achievement[];
}

export class AchievementService {
  private achievements: Achievement[] = [
    // Participation Achievements
    {
      id: 'first-steps',
      name: 'First Steps',
      description: 'Join your first hackathon event',
      icon: '🚀',
      category: 'participation',
      points: 50,
      rarity: 'common',
      condition: (stats) => stats.eventsParticipated >= 1,
      unlocked: false
    },
    {
      id: 'veteran-hacker',
      name: 'Veteran Hacker',
      description: 'Participate in 5 hackathon events',
      icon: '🎖️',
      category: 'participation',
      points: 250,
      rarity: 'rare',
      condition: (stats) => stats.eventsParticipated >= 5,
      unlocked: false
    },
    {
      id: 'hackathon-legend',
      name: 'Hackathon Legend',
      description: 'Participate in 20 hackathon events',
      icon: '👑',
      category: 'participation',
      points: 1000,
      rarity: 'legendary',
      condition: (stats) => stats.eventsParticipated >= 20,
      unlocked: false
    },

    // Performance Achievements
    {
      id: 'rising-star',
      name: 'Rising Star',
      description: 'Achieve an average score above 80%',
      icon: '⭐',
      category: 'performance',
      points: 200,
      rarity: 'rare',
      condition: (stats) => stats.averageScore >= 80,
      unlocked: false
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Achieve an average score above 95%',
      icon: '💎',
      category: 'performance',
      points: 500,
      rarity: 'epic',
      condition: (stats) => stats.averageScore >= 95,
      unlocked: false
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Win 3 hackathon competitions',
      icon: '🏆',
      category: 'performance',
      points: 750,
      rarity: 'legendary',
      condition: (stats) => stats.winCount >= 3,
      unlocked: false
    },

    // Collaboration Achievements
    {
      id: 'team-builder',
      name: 'Team Builder',
      description: 'Create 5 successful teams',
      icon: '🤝',
      category: 'collaboration',
      points: 300,
      rarity: 'rare',
      condition: (stats) => stats.teamsCreated >= 5,
      unlocked: false
    },
    {
      id: 'helpful-hand',
      name: 'Helpful Hand',
      description: 'Receive 50 helpful votes in chat',
      icon: '🙏',
      category: 'collaboration',
      points: 200,
      rarity: 'rare',
      condition: (stats) => stats.helpfulVotes >= 50,
      unlocked: false
    },
    {
      id: 'master-collaborator',
      name: 'Master Collaborator',
      description: 'Achieve collaboration score of 90+',
      icon: '🌟',
      category: 'collaboration',
      points: 400,
      rarity: 'epic',
      condition: (stats) => stats.collaborationScore >= 90,
      unlocked: false
    },

    // Innovation Achievements
    {
      id: 'creative-mind',
      name: 'Creative Mind',
      description: 'Submit 10 innovative projects',
      icon: '💡',
      category: 'innovation',
      points: 300,
      rarity: 'rare',
      condition: (stats) => stats.submissionsCount >= 10 && stats.innovationRating >= 7.5,
      unlocked: false
    },
    {
      id: 'disruptor',
      name: 'Disruptor',
      description: 'Achieve innovation rating of 9.0+',
      icon: '🔥',
      category: 'innovation',
      points: 600,
      rarity: 'epic',
      condition: (stats) => stats.innovationRating >= 9.0,
      unlocked: false
    },

    // Leadership Achievements
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Judge 10 hackathon events',
      icon: '🧠',
      category: 'leadership',
      points: 500,
      rarity: 'epic',
      condition: (stats) => stats.judgeCount >= 10,
      unlocked: false
    },
    {
      id: 'organizer-pro',
      name: 'Organizer Pro',
      description: 'Successfully organize 5 hackathon events',
      icon: '📋',
      category: 'leadership',
      points: 750,
      rarity: 'legendary',
      condition: (stats) => stats.organizerCount >= 5,
      unlocked: false
    },

    // Special Achievements
    {
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'Join the platform in beta phase',
      icon: '🚪',
      category: 'participation',
      points: 100,
      rarity: 'rare',
      condition: () => new Date() < new Date('2025-01-01'), // Beta period
      unlocked: false
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain 30-day activity streak',
      icon: '🔥',
      category: 'participation',
      points: 400,
      rarity: 'epic',
      condition: (stats) => stats.streakDays >= 30,
      unlocked: false
    },
    {
      id: 'community-hero',
      name: 'Community Hero',
      description: 'Send 1000 helpful chat messages',
      icon: '💬',
      category: 'collaboration',
      points: 300,
      rarity: 'rare',
      condition: (stats) => stats.chatMessagesCount >= 1000,
      unlocked: false
    }
  ];

  /**
   * Calculate user level based on total points
   */
  private calculateLevel(points: number): { level: number; nextLevelPoints: number } {
    const levels = [
      { level: 1, threshold: 0 },
      { level: 2, threshold: 100 },
      { level: 3, threshold: 300 },
      { level: 4, threshold: 600 },
      { level: 5, threshold: 1000 },
      { level: 6, threshold: 1500 },
      { level: 7, threshold: 2200 },
      { level: 8, threshold: 3000 },
      { level: 9, threshold: 4000 },
      { level: 10, threshold: 5500 },
      { level: 11, threshold: 7500 },
      { level: 12, threshold: 10000 }
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (points >= levels[i].threshold) {
        const nextLevel = levels[i + 1];
        return {
          level: levels[i].level,
          nextLevelPoints: nextLevel ? nextLevel.threshold : levels[i].threshold
        };
      }
    }

    return { level: 1, nextLevelPoints: 100 };
  }

  /**
   * Get user's mock stats (in real app, would query database)
   */
  private async getUserStats(userId: string): Promise<UserStats> {
    // Mock data - in real app would query actual user data
    return {
      eventsParticipated: Math.floor(Math.random() * 10) + 1,
      teamsCreated: Math.floor(Math.random() * 5) + 1,
      submissionsCount: Math.floor(Math.random() * 8) + 2,
      averageScore: Math.random() * 40 + 60, // 60-100
      chatMessagesCount: Math.floor(Math.random() * 500) + 50,
      helpfulVotes: Math.floor(Math.random() * 30) + 5,
      winCount: Math.floor(Math.random() * 3),
      judgeCount: Math.floor(Math.random() * 5),
      organizerCount: Math.floor(Math.random() * 2),
      streakDays: Math.floor(Math.random() * 45) + 1,
      collaborationScore: Math.random() * 30 + 70, // 70-100
      innovationRating: Math.random() * 3 + 7 // 7-10
    };
  }

  /**
   * Check and unlock new achievements for user
   */
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const userStats = await this.getUserStats(userId);
    const newUnlocks: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (!achievement.unlocked && achievement.condition(userStats)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newUnlocks.push({ ...achievement });
        
        console.log(`🎉 Achievement unlocked for user ${userId}: ${achievement.name}`);
      }
    }

    return newUnlocks;
  }

  /**
   * Get all achievements for user with unlock status
   */
  async getUserAchievements(userId: string): Promise<UserAchievements> {
    const userStats = await this.getUserStats(userId);
    const updatedAchievements = [...this.achievements];

    // Check for new unlocks
    await this.checkAchievements(userId);

    // Calculate total points from unlocked achievements
    const totalPoints = updatedAchievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    const { level, nextLevelPoints } = this.calculateLevel(totalPoints);

    // Get recent unlocks (last 7 days)
    const recentUnlocks = updatedAchievements
      .filter(a => a.unlocked && a.unlockedAt && 
        (new Date().getTime() - a.unlockedAt.getTime()) < 7 * 24 * 60 * 60 * 1000);

    return {
      userId,
      totalPoints,
      level,
      nextLevelPoints,
      achievements: updatedAchievements,
      recentUnlocks
    };
  }

  /**
   * Get leaderboard of top achievers
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    userName: string;
    totalPoints: number;
    level: number;
    achievementCount: number;
    rareAchievements: number;
  }>> {
    // Mock leaderboard data
    const mockUsers = [
      { userId: '1', userName: 'Alice Johnson', multiplier: 1.2 },
      { userId: '2', userName: 'Bob Smith', multiplier: 1.0 },
      { userId: '3', userName: 'Charlie Brown', multiplier: 0.8 },
      { userId: '4', userName: 'Diana Prince', multiplier: 1.5 },
      { userId: '5', userName: 'Edward Wong', multiplier: 0.9 },
      { userId: '6', userName: 'Fiona Garcia', multiplier: 1.1 },
      { userId: '7', userName: 'George Miller', multiplier: 0.7 },
      { userId: '8', userName: 'Hannah Davis', multiplier: 1.3 }
    ];

    const leaderboard = [];

    for (const user of mockUsers.slice(0, limit)) {
      const basePoints = Math.floor(Math.random() * 3000 + 500);
      const totalPoints = Math.floor(basePoints * user.multiplier);
      const { level } = this.calculateLevel(totalPoints);
      const achievementCount = Math.floor(totalPoints / 100);
      const rareAchievements = Math.floor(achievementCount * 0.3);

      leaderboard.push({
        userId: user.userId,
        userName: user.userName,
        totalPoints,
        level,
        achievementCount,
        rareAchievements
      });
    }

    return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(): Promise<{
    totalAchievements: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
    averagePointsPerUser: number;
    topAchievement: Achievement;
  }> {
    const byCategory = this.achievements.reduce((acc, ach) => {
      acc[ach.category] = (acc[ach.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRarity = this.achievements.reduce((acc, ach) => {
      acc[ach.rarity] = (acc[ach.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAchievement = this.achievements.reduce((max, ach) => 
      ach.points > max.points ? ach : max
    );

    return {
      totalAchievements: this.achievements.length,
      byCategory,
      byRarity,
      averagePointsPerUser: 850, // Mock average
      topAchievement
    };
  }
}

// Export singleton instance
export const achievementService = new AchievementService();