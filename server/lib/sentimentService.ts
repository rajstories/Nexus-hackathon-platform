// Advanced AI Sentiment Analysis Service for Chat Monitoring
// In production, would use actual NLP libraries like sentiment, natural, or cloud APIs

interface SentimentResult {
  score: number; // -1 to 1 (-1 very negative, 0 neutral, 1 very positive)
  magnitude: number; // 0 to 1 (intensity of emotion)
  label: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0 to 1
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
}

interface ChatAnalysis {
  messageId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  content: string;
  sentiment: SentimentResult;
  flagged: boolean;
  flagReason?: string;
  toxicityScore: number; // 0 to 1
  helpfulnessScore: number; // 0 to 1
}

interface EventSentimentSummary {
  eventId: string;
  totalMessages: number;
  averageSentiment: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  toxicityLevel: 'low' | 'medium' | 'high';
  helpfulnessLevel: 'low' | 'medium' | 'high';
  topPositiveMessages: ChatAnalysis[];
  flaggedMessages: ChatAnalysis[];
  emotionalBreakdown: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
}

export class SentimentService {
  // Word dictionaries for basic sentiment analysis
  private positiveWords = [
    'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'helpful',
    'innovative', 'love', 'perfect', 'wonderful', 'excited', 'happy', 'glad',
    'appreciate', 'thank', 'thanks', 'good', 'nice', 'cool', 'impressive',
    'creative', 'smart', 'clever', 'genius', 'outstanding', 'superb'
  ];

  private negativeWords = [
    'awful', 'bad', 'terrible', 'horrible', 'hate', 'stupid', 'dumb', 'worst',
    'sucks', 'useless', 'broken', 'fail', 'failed', 'wrong', 'error', 'problem',
    'issue', 'bug', 'frustrated', 'angry', 'mad', 'disappointed', 'confused'
  ];

  private toxicWords = [
    'toxic', 'spam', 'cheat', 'steal', 'copy', 'fake', 'scam', 'trash', 'garbage',
    'idiots', 'morons', 'losers', 'pathetic', 'lame'
  ];

  private helpfulWords = [
    'help', 'assist', 'support', 'guide', 'explain', 'tutorial', 'tip', 'advice',
    'suggestion', 'recommend', 'share', 'resource', 'solution', 'fix', 'solve',
    'answer', 'clarify', 'documentation', 'example', 'demo'
  ];

  /**
   * Analyze sentiment of a single message
   */
  analyzeSentiment(message: string): SentimentResult {
    const words = message.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let emotionScores = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      disgust: 0
    };

    // Count positive and negative words
    words.forEach(word => {
      if (this.positiveWords.includes(word)) {
        positiveScore++;
        emotionScores.joy += 0.3;
      }
      if (this.negativeWords.includes(word)) {
        negativeScore++;
        emotionScores.anger += 0.2;
        emotionScores.sadness += 0.2;
      }
    });

    // Advanced patterns
    if (message.includes('!')) emotionScores.surprise += 0.2;
    if (message.includes('??')) emotionScores.fear += 0.1;
    if (message.match(/[A-Z]{3,}/)) emotionScores.anger += 0.3; // ALL CAPS

    // Calculate overall sentiment
    const totalWords = words.length;
    const score = totalWords > 0 ? (positiveScore - negativeScore) / totalWords : 0;
    const normalizedScore = Math.max(-1, Math.min(1, score * 2));
    
    const magnitude = Math.abs(normalizedScore);
    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    
    if (normalizedScore > 0.1) label = 'positive';
    else if (normalizedScore < -0.1) label = 'negative';

    const confidence = Math.min(0.95, Math.max(0.5, magnitude + 0.3));

    // Normalize emotions
    const maxEmotion = Math.max(...Object.values(emotionScores));
    if (maxEmotion > 0) {
      Object.keys(emotionScores).forEach(key => {
        emotionScores[key as keyof typeof emotionScores] = 
          Math.min(1, emotionScores[key as keyof typeof emotionScores] / maxEmotion);
      });
    }

    return {
      score: normalizedScore,
      magnitude,
      label,
      confidence,
      emotions: emotionScores
    };
  }

  /**
   * Calculate toxicity score
   */
  private calculateToxicity(message: string): number {
    const words = message.toLowerCase().split(/\s+/);
    let toxicCount = 0;

    words.forEach(word => {
      if (this.toxicWords.includes(word)) toxicCount++;
    });

    // Check for toxic patterns
    let toxicPatterns = 0;
    if (message.match(/[A-Z]{5,}/)) toxicPatterns++; // Excessive caps
    if (message.match(/(.)\1{4,}/)) toxicPatterns++; // Repeated characters
    if (message.length > 0 && message.split('!').length > 5) toxicPatterns++; // Excessive exclamation

    const toxicityRatio = (toxicCount + toxicPatterns) / Math.max(1, words.length);
    return Math.min(1, toxicityRatio * 3);
  }

  /**
   * Calculate helpfulness score
   */
  private calculateHelpfulness(message: string): number {
    const words = message.toLowerCase().split(/\s+/);
    let helpfulCount = 0;

    words.forEach(word => {
      if (this.helpfulWords.includes(word)) helpfulCount++;
    });

    // Helpful patterns
    let helpfulPatterns = 0;
    if (message.includes('http')) helpfulPatterns++; // Links
    if (message.includes('```') || message.includes('`')) helpfulPatterns++; // Code
    if (message.match(/\d+\./)) helpfulPatterns++; // Numbered lists
    if (message.length > 50 && message.includes('?')) helpfulPatterns++; // Detailed questions

    const helpfulnessRatio = (helpfulCount + helpfulPatterns) / Math.max(1, words.length * 0.3);
    return Math.min(1, helpfulnessRatio);
  }

  /**
   * Analyze a chat message comprehensively
   */
  analyzeMessage(
    messageId: string,
    userId: string,
    userName: string,
    content: string,
    timestamp: Date = new Date()
  ): ChatAnalysis {
    const sentiment = this.analyzeSentiment(content);
    const toxicityScore = this.calculateToxicity(content);
    const helpfulnessScore = this.calculateHelpfulness(content);

    // Flag problematic messages
    const flagged = toxicityScore > 0.6 || 
                   (sentiment.label === 'negative' && sentiment.magnitude > 0.8);
    
    let flagReason;
    if (toxicityScore > 0.6) flagReason = 'High toxicity detected';
    else if (sentiment.label === 'negative' && sentiment.magnitude > 0.8) {
      flagReason = 'Strong negative sentiment';
    }

    return {
      messageId,
      userId,
      userName,
      timestamp,
      content,
      sentiment,
      flagged,
      flagReason,
      toxicityScore,
      helpfulnessScore
    };
  }

  /**
   * Analyze sentiment trends for an entire event
   */
  async analyzeEventSentiment(eventId: string): Promise<EventSentimentSummary> {
    // In real implementation, would query chat messages from MongoDB
    // For demo, generate realistic mock data
    
    const mockMessages = this.generateMockChatMessages(eventId);
    const analyses = mockMessages.map(msg => 
      this.analyzeMessage(msg.id, msg.userId, msg.userName, msg.content, msg.timestamp)
    );

    const totalMessages = analyses.length;
    const averageSentiment = analyses.reduce((sum, a) => sum + a.sentiment.score, 0) / totalMessages;
    
    const positiveCount = analyses.filter(a => a.sentiment.label === 'positive').length;
    const negativeCount = analyses.filter(a => a.sentiment.label === 'negative').length;
    const neutralCount = totalMessages - positiveCount - negativeCount;

    const positiveRatio = positiveCount / totalMessages;
    const negativeRatio = negativeCount / totalMessages;
    const neutralRatio = neutralCount / totalMessages;

    const averageToxicity = analyses.reduce((sum, a) => sum + a.toxicityScore, 0) / totalMessages;
    const averageHelpfulness = analyses.reduce((sum, a) => sum + a.helpfulnessScore, 0) / totalMessages;

    const toxicityLevel: 'low' | 'medium' | 'high' = 
      averageToxicity < 0.3 ? 'low' : averageToxicity < 0.6 ? 'medium' : 'high';
    
    const helpfulnessLevel: 'low' | 'medium' | 'high' = 
      averageHelpfulness < 0.3 ? 'low' : averageHelpfulness < 0.6 ? 'medium' : 'high';

    // Get top positive and flagged messages
    const topPositiveMessages = analyses
      .filter(a => a.sentiment.label === 'positive')
      .sort((a, b) => b.sentiment.score - a.sentiment.score)
      .slice(0, 5);

    const flaggedMessages = analyses.filter(a => a.flagged);

    // Calculate emotional breakdown
    const emotionalBreakdown = analyses.reduce((acc, a) => {
      Object.keys(a.sentiment.emotions).forEach(emotion => {
        acc[emotion as keyof typeof acc] += a.sentiment.emotions[emotion as keyof typeof a.sentiment.emotions];
      });
      return acc;
    }, {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      disgust: 0
    });

    // Normalize emotional breakdown
    const maxEmotion = Math.max(...Object.values(emotionalBreakdown));
    if (maxEmotion > 0) {
      Object.keys(emotionalBreakdown).forEach(emotion => {
        emotionalBreakdown[emotion as keyof typeof emotionalBreakdown] /= maxEmotion;
      });
    }

    return {
      eventId,
      totalMessages,
      averageSentiment,
      positiveRatio,
      negativeRatio,
      neutralRatio,
      toxicityLevel,
      helpfulnessLevel,
      topPositiveMessages,
      flaggedMessages,
      emotionalBreakdown
    };
  }

  /**
   * Generate realistic mock chat messages for demo
   */
  private generateMockChatMessages(eventId: string) {
    const mockMessages = [
      { id: '1', userId: '1', userName: 'Alice', content: 'This hackathon is amazing! Really excited to build something innovative.' },
      { id: '2', userId: '2', userName: 'Bob', content: 'Can someone help me with the API documentation? Having trouble with authentication.' },
      { id: '3', userId: '3', userName: 'Charlie', content: 'Thanks for the tip about React hooks! That really helped solve my problem.' },
      { id: '4', userId: '4', userName: 'Diana', content: 'My code keeps crashing... This is so frustrating! Nothing works!' },
      { id: '5', userId: '5', userName: 'Eve', content: 'Great presentation by the sponsor! Really inspiring stuff about AI.' },
      { id: '6', userId: '6', userName: 'Frank', content: 'Here\'s a useful tutorial I found: https://example.com/tutorial - hope this helps!' },
      { id: '7', userId: '7', userName: 'Grace', content: 'Anyone want to collaborate on a blockchain project? I have some interesting ideas.' },
      { id: '8', userId: '8', userName: 'Henry', content: 'This platform is terrible! Everything is broken and poorly designed.' },
      { id: '9', userId: '9', userName: 'Iris', content: 'Love the real-time features! The chat and leaderboard updates are so smooth.' },
      { id: '10', userId: '10', userName: 'Jack', content: 'Quick question: what\'s the submission deadline again? Want to make sure I don\'t miss it.' }
    ];

    return mockMessages.map(msg => ({
      ...msg,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours
    }));
  }
}

// Export singleton instance
export const sentimentService = new SentimentService();