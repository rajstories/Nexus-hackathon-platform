import axios from 'axios';
import { AzureSQLAnalytics } from '../db/azure-sql';

// Define types to fix TypeScript errors
interface GitHubRepoInfo {
  fork: boolean;
  created_at: string;
  [key: string]: any;
}

// Azure AI Text Analytics for plagiarism detection
interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  version: string;
}

const azureAIConfig: AzureAIConfig = {
  endpoint: process.env.AZURE_AI_ENDPOINT || '',
  apiKey: process.env.AZURE_AI_API_KEY || '',
  version: '2023-04-01'
};

interface PlagiarismResult {
  similarityScore: number;
  plagiarismFlags: number;
  detectedSources: string[];
  suspiciousPatterns: string[];
  confidence: number;
}

interface SubmissionContent {
  title: string;
  description: string;
  githubUrl?: string;
  additionalLinks?: string[];
}

export class AIPlagiarismDetector {
  
  /**
   * Main function to detect plagiarism in submission content
   */
  static async detectPlagiarism(submissionId: string, teamId: string, content: SubmissionContent): Promise<PlagiarismResult> {
    try {
      console.log(`🔍 Starting AI plagiarism detection for submission ${submissionId}`);

      const results = await Promise.all([
        this.analyzeTextSimilarity(content.title + ' ' + content.description),
        this.checkGitHubOriginality(content.githubUrl),
        this.detectPatterns(content.description),
        this.crossReferenceSubmissions(content, teamId)
      ]);

      const [textAnalysis, githubAnalysis, patternAnalysis, crossRefAnalysis] = results;

      // Combine all analysis results
      const combinedResult: PlagiarismResult = {
        similarityScore: Math.max(
          textAnalysis.similarity,
          githubAnalysis.similarity,
          crossRefAnalysis.similarity
        ),
        plagiarismFlags: textAnalysis.flags + githubAnalysis.flags + patternAnalysis.flags,
        detectedSources: [
          ...textAnalysis.sources,
          ...githubAnalysis.sources,
          ...crossRefAnalysis.sources
        ].filter((source, index, arr) => arr.indexOf(source) === index), // Remove duplicates
        suspiciousPatterns: [
          ...patternAnalysis.patterns,
          ...textAnalysis.patterns
        ],
        confidence: (textAnalysis.confidence + githubAnalysis.confidence + patternAnalysis.confidence) / 3
      };

      // Record analytics in Azure SQL
      await AzureSQLAnalytics.recordSubmissionAnalytics(submissionId, teamId, {
        similarityScore: combinedResult.similarityScore,
        plagiarismFlags: combinedResult.plagiarismFlags,
        evaluationMetrics: {
          detectedSources: combinedResult.detectedSources.length,
          suspiciousPatterns: combinedResult.suspiciousPatterns.length,
          confidence: combinedResult.confidence,
          analysisTimestamp: new Date().toISOString()
        }
      });

      console.log(`✅ Plagiarism detection completed for ${submissionId}: ${combinedResult.similarityScore}% similarity`);
      return combinedResult;

    } catch (error) {
      console.error('❌ Error in plagiarism detection:', error);
      throw error;
    }
  }

  /**
   * Analyze text similarity using Azure AI Text Analytics
   */
  private static async analyzeTextSimilarity(text: string): Promise<{
    similarity: number;
    flags: number;
    sources: string[];
    patterns: string[];
    confidence: number;
  }> {
    try {
      if (!azureAIConfig.apiKey || !azureAIConfig.endpoint) {
        console.warn('⚠️ Azure AI credentials not configured, using fallback analysis');
        return this.fallbackTextAnalysis(text);
      }

      // Azure AI Text Analytics API call
      const response = await axios.post(
        `${azureAIConfig.endpoint}/text/analytics/v${azureAIConfig.version}/analyze`,
        {
          displayName: 'PlagiarismDetection',
          analysisInput: {
            documents: [{
              id: '1',
              text: text,
              language: 'en'
            }]
          },
          tasks: [
            {
              kind: 'KeyPhraseExtraction'
            },
            {
              kind: 'EntityRecognition'
            }
          ]
        },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': azureAIConfig.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // Process Azure AI response to detect similarity patterns
      const keyPhrases = response.data.tasks?.keyPhraseExtractionTasks?.[0]?.results?.documents?.[0]?.keyPhrases || [];
      const entities = response.data.tasks?.entityRecognitionTasks?.[0]?.results?.documents?.[0]?.entities || [];

      // Calculate similarity based on common patterns
      const commonPhrases = this.detectCommonPhrases(keyPhrases);
      const suspiciousPhrases = this.detectSuspiciousPatterns(text);
      
      return {
        similarity: Math.min(commonPhrases.length * 15, 100), // Cap at 100%
        flags: suspiciousPhrases.length + (commonPhrases.length > 5 ? 1 : 0),
        sources: this.extractPotentialSources(entities),
        patterns: [...commonPhrases, ...suspiciousPhrases],
        confidence: response.data.tasks ? 0.85 : 0.3
      };

    } catch (error) {
      console.error('Error in Azure AI text analysis:', error);
      return this.fallbackTextAnalysis(text);
    }
  }

  /**
   * Check GitHub repository for originality
   */
  private static async checkGitHubOriginality(githubUrl?: string): Promise<{
    similarity: number;
    flags: number;
    sources: string[];
    confidence: number;
  }> {
    if (!githubUrl) {
      return { similarity: 0, flags: 0, sources: [], confidence: 1.0 };
    }

    try {
      // Extract GitHub repo info
      const repoMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) {
        return { similarity: 0, flags: 1, sources: ['Invalid GitHub URL'], confidence: 0.9 };
      }

      const [, owner, repo] = repoMatch;
      
      // Basic GitHub API checks (would be enhanced with full implementation)
      const repoInfo = await this.fetchGitHubRepoInfo(owner, repo);
      
      let similarity = 0;
      let flags = 0;
      const sources: string[] = [];

      // Check for fork indicators
      if (repoInfo?.fork) {
        similarity += 40;
        flags += 1;
        sources.push('Repository is a fork');
      }

      // Check creation date vs submission deadline
      if (repoInfo?.created_at) {
        const createdDate = new Date(repoInfo.created_at);
        const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation < 7) {
          flags += 1; // Suspicious: repo created very recently
        }
      }

      return {
        similarity: Math.min(similarity, 100),
        flags,
        sources,
        confidence: 0.8
      };

    } catch (error) {
      console.error('Error checking GitHub originality:', error);
      return { similarity: 0, flags: 0, sources: ['GitHub analysis failed'], confidence: 0.1 };
    }
  }

  /**
   * Detect suspicious patterns in text
   */
  private static detectPatterns(text: string): Promise<{
    flags: number;
    patterns: string[];
    confidence: number;
  }> {
    const suspiciousPatterns = [
      /lorem ipsum/gi,
      /placeholder text/gi,
      /sample data/gi,
      /TODO:/gi,
      /FIXME:/gi,
      /template/gi,
      /boilerplate/gi,
      /(copy|copied) (from|of)/gi,
      /based on tutorial/gi,
      /following a guide/gi
    ];

    const detectedPatterns: string[] = [];
    let flags = 0;

    for (const pattern of suspiciousPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        flags += matches.length;
        detectedPatterns.push(...matches);
      }
    }

    // Check for repetitive patterns
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 3) { // Only check meaningful words
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    // Flag excessive repetition
    for (const [word, count] of wordFreq.entries()) {
      if (count > Math.max(3, words.length * 0.1)) {
        flags += 1;
        detectedPatterns.push(`Excessive repetition: "${word}" (${count} times)`);
      }
    }

    return Promise.resolve({
      flags: Math.min(flags, 10), // Cap flags
      patterns: detectedPatterns.slice(0, 10), // Limit patterns
      confidence: 0.7
    });
  }

  /**
   * Cross-reference with other submissions in the same event
   */
  private static async crossReferenceSubmissions(content: SubmissionContent, teamId: string): Promise<{
    similarity: number;
    sources: string[];
  }> {
    try {
      // This would typically query the database for other submissions
      // For now, return a basic implementation
      
      const keyWords = this.extractKeywords(content.description);
      
      // In a full implementation, this would:
      // 1. Query database for other submissions
      // 2. Compare content using similarity algorithms
      // 3. Flag high similarity matches
      
      return {
        similarity: 0, // Placeholder - would be calculated based on actual comparisons
        sources: []
      };

    } catch (error) {
      console.error('Error in cross-reference analysis:', error);
      return { similarity: 0, sources: [] };
    }
  }

  /**
   * Fallback text analysis when Azure AI is not available
   */
  private static fallbackTextAnalysis(text: string): {
    similarity: number;
    flags: number;
    sources: string[];
    patterns: string[];
    confidence: number;
  } {
    const suspiciousKeywords = ['tutorial', 'example', 'template', 'copy', 'fork', 'clone'];
    const flags = suspiciousKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;

    return {
      similarity: Math.min(flags * 15, 50), // Lower confidence without AI
      flags,
      sources: ['Fallback analysis - Azure AI unavailable'],
      patterns: [],
      confidence: 0.3
    };
  }

  /**
   * Utility functions
   */
  private static detectCommonPhrases(keyPhrases: string[]): string[] {
    const commonHackathonPhrases = [
      'web application', 'machine learning', 'data visualization',
      'mobile app', 'api integration', 'real-time chat'
    ];
    
    return keyPhrases.filter(phrase => 
      commonHackathonPhrases.some(common => 
        phrase.toLowerCase().includes(common.toLowerCase())
      )
    );
  }

  private static detectSuspiciousPatterns(text: string): string[] {
    const patterns = [];
    
    if (text.length < 50) patterns.push('Very short description');
    if (/(.)\1{10,}/.test(text)) patterns.push('Repeated characters');
    if (text.split(' ').length < 10) patterns.push('Insufficient detail');
    
    return patterns;
  }

  private static extractPotentialSources(entities: any[]): string[] {
    return entities
      .filter(entity => entity.category === 'Organization' || entity.category === 'Product')
      .map(entity => entity.text)
      .slice(0, 5); // Limit to 5 sources
  }

  private static async fetchGitHubRepoInfo(owner: string, repo: string): Promise<any> {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Nexus-Hackathon-Platform'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching GitHub repo info:', error);
      return null;
    }
  }

  private static extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20);
  }
}

export type { PlagiarismResult, SubmissionContent };