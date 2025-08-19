import natural from 'natural';
import { SimilarityIndex } from '../db/models/SimilarityIndex';
import { connectMongoDB, isMongoConnected } from '../db/mongo';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { submissions, teams } from '@shared/schema';

// Initialize TF-IDF
const TfIdf = natural.TfIdf;

interface SubmissionData {
  id: string;
  title: string;
  description?: string;
  repoUrl?: string;
  teamName: string;
  readme?: string;
  combinedText: string;
}

interface SimilarityPair {
  submission1: SubmissionData;
  submission2: SubmissionData;
  score: number;
}

export class SimilarityService {
  private tfidf: any;
  
  constructor() {
    this.tfidf = new TfIdf();
  }
  
  /**
   * Fetch README content from GitHub repo URL
   */
  private async fetchReadmeFromRepo(repoUrl: string): Promise<string | null> {
    try {
      // Extract owner and repo from GitHub URL
      const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/\s]+)/);
      if (!match) return null;
      
      const [, owner, repo] = match;
      const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo.replace('.git', '')}/main/README.md`;
      
      // Try main branch first
      let response = await fetch(readmeUrl);
      
      // If main doesn't exist, try master branch
      if (!response.ok) {
        const masterUrl = readmeUrl.replace('/main/', '/master/');
        response = await fetch(masterUrl);
      }
      
      if (response.ok) {
        const content = await response.text();
        // Clean and truncate README to first 1000 chars for performance
        return content.substring(0, 1000).replace(/[#*`\[\]]/g, ' ').trim();
      }
    } catch (error) {
      console.error(`Failed to fetch README from ${repoUrl}:`, error);
    }
    
    return null;
  }
  
  /**
   * Preprocess text for TF-IDF
   */
  private preprocessText(text: string): string {
    // Convert to lowercase, remove special chars, normalize whitespace
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Build TF-IDF vectors for all submissions
   */
  private async buildVectors(submissions: SubmissionData[]): Promise<void> {
    this.tfidf = new TfIdf();
    
    for (const submission of submissions) {
      // Fetch README if repo URL exists
      if (submission.repoUrl && submission.repoUrl.includes('github')) {
        submission.readme = await this.fetchReadmeFromRepo(submission.repoUrl) || '';
      }
      
      // Combine title, description, and README
      const combinedText = [
        submission.title,
        submission.description || '',
        submission.readme || ''
      ].join(' ');
      
      submission.combinedText = this.preprocessText(combinedText);
      
      // Add document to TF-IDF
      this.tfidf.addDocument(submission.combinedText);
    }
  }
  
  /**
   * Calculate cosine similarity between two TF-IDF vectors
   */
  private calculateCosineSimilarity(docIndex1: number, docIndex2: number): number {
    const terms = new Set<string>();
    
    // Get all unique terms from both documents
    this.tfidf.documents[docIndex1].forEach((value: number, term: string) => {
      terms.add(term);
    });
    this.tfidf.documents[docIndex2].forEach((value: number, term: string) => {
      terms.add(term);
    });
    
    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    terms.forEach(term => {
      const tfidf1 = this.tfidf.tfidf(term, docIndex1);
      const tfidf2 = this.tfidf.tfidf(term, docIndex2);
      
      dotProduct += tfidf1 * tfidf2;
      magnitude1 += tfidf1 * tfidf1;
      magnitude2 += tfidf2 * tfidf2;
    });
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Avoid division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  /**
   * Find similar submission pairs
   */
  private findSimilarPairs(
    submissions: SubmissionData[], 
    threshold: number = 0.8
  ): SimilarityPair[] {
    const pairs: SimilarityPair[] = [];
    
    // Compare all pairs
    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {
        const similarity = this.calculateCosineSimilarity(i, j);
        
        if (similarity >= threshold) {
          pairs.push({
            submission1: submissions[i],
            submission2: submissions[j],
            score: similarity
          });
        }
      }
    }
    
    // Sort by similarity score descending
    pairs.sort((a, b) => b.score - a.score);
    
    // Return top 5 pairs
    return pairs.slice(0, 5);
  }
  
  /**
   * Analyze submissions for similarity
   */
  async analyzeEventSubmissions(eventId: string): Promise<{
    analyzed: number;
    flagged: number;
    topPairs: SimilarityPair[];
  }> {
    try {
      // Get all submissions for the event
      const eventSubmissions = await db
        .select({
          id: submissions.id,
          title: submissions.title,
          description: submissions.description,
          repoUrl: submissions.repoUrl,
          teamId: submissions.teamId,
          teamName: teams.name,
        })
        .from(submissions)
        .innerJoin(teams, eq(submissions.teamId, teams.id))
        .where(eq(submissions.eventId, eventId));
      
      if (eventSubmissions.length < 2) {
        return {
          analyzed: eventSubmissions.length,
          flagged: 0,
          topPairs: []
        };
      }
      
      const submissionData: SubmissionData[] = eventSubmissions.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || '',
        repoUrl: s.repoUrl || '',
        teamName: s.teamName,
        combinedText: ''
      }));
      
      // Build TF-IDF vectors
      await this.buildVectors(submissionData);
      
      // Find similar pairs
      const similarPairs = this.findSimilarPairs(submissionData, 0.8);
      
      // Store in MongoDB if connected
      if (isMongoConnected()) {
        try {
          await connectMongoDB();
          
          // Clear existing similarity data for this event
          await SimilarityIndex.deleteMany({ eventId });
          
          // Store new similarity pairs
          for (const pair of similarPairs) {
            // Ensure submission1Id < submission2Id for consistency
            const [sub1, sub2] = pair.submission1.id < pair.submission2.id
              ? [pair.submission1, pair.submission2]
              : [pair.submission2, pair.submission1];
            
            await SimilarityIndex.create({
              eventId,
              submission1Id: sub1.id,
              submission1Title: sub1.title,
              submission1TeamName: sub1.teamName,
              submission2Id: sub2.id,
              submission2Title: sub2.title,
              submission2TeamName: sub2.teamName,
              similarityScore: pair.score,
              textSnippet1: sub1.combinedText.substring(0, 200),
              textSnippet2: sub2.combinedText.substring(0, 200),
              detectedAt: new Date()
            });
          }
        } catch (mongoError) {
          console.error('Failed to store similarity data in MongoDB:', mongoError);
        }
      }
      
      return {
        analyzed: eventSubmissions.length,
        flagged: similarPairs.length,
        topPairs: similarPairs
      };
      
    } catch (error) {
      console.error('Similarity analysis error:', error);
      throw error;
    }
  }
  
  /**
   * Get similarity results from MongoDB
   */
  async getSimilarityResults(eventId: string): Promise<any[]> {
    if (!isMongoConnected()) {
      return [];
    }
    
    try {
      await connectMongoDB();
      
      const results = await SimilarityIndex
        .find({ eventId })
        .sort({ similarityScore: -1 })
        .limit(10)
        .lean();
      
      return results;
    } catch (error) {
      console.error('Failed to get similarity results:', error);
      return [];
    }
  }
  
  /**
   * Mark a similarity pair as reviewed
   */
  async markAsReviewed(
    eventId: string, 
    submission1Id: string, 
    submission2Id: string,
    reviewerId: string,
    notes: string
  ): Promise<boolean> {
    if (!isMongoConnected()) {
      return false;
    }
    
    try {
      await connectMongoDB();
      
      // Handle both orderings
      const result = await SimilarityIndex.findOneAndUpdate(
        {
          eventId,
          $or: [
            { submission1Id, submission2Id },
            { submission1Id: submission2Id, submission2Id: submission1Id }
          ]
        },
        {
          reviewed: true,
          reviewedBy: reviewerId,
          reviewNotes: notes
        },
        { new: true }
      );
      
      return !!result;
    } catch (error) {
      console.error('Failed to mark as reviewed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const similarityService = new SimilarityService();