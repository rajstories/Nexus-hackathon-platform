import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle, Eye, RefreshCw, FileSearch, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimilarityResult {
  submission1: {
    id: string;
    title: string;
    teamName: string;
    snippet?: string;
  };
  submission2: {
    id: string;
    title: string;
    teamName: string;
    snippet?: string;
  };
  similarityScore: number;
  percentageMatch: number;
  detectedAt?: string;
  reviewed?: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface SimilarityPanelProps {
  eventId: string;
  authToken?: string;
}

export function SimilarityPanel({ eventId, authToken }: SimilarityPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPair, setSelectedPair] = useState<SimilarityResult | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Fetch similarity results
  const { data: similarityData, isLoading, refetch } = useQuery({
    queryKey: ['/api/similarity', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/similarity/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch similarity results');
      return response.json();
    },
  });
  
  // Run similarity analysis
  const analyzeSubmissions = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/similarity/${eventId}?analyze=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to run analysis');
      
      const result = await response.json();
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${result.analyzed} submissions, found ${result.flagged} potential matches`,
      });
      
      // Refetch to get updated results
      refetch();
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Mark as reviewed mutation
  const markReviewedMutation = useMutation({
    mutationFn: async (data: { submission1Id: string; submission2Id: string; notes: string }) => {
      const response = await fetch(`/api/similarity/${eventId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to mark as reviewed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Saved",
        description: "The similarity pair has been marked as reviewed.",
      });
      setSelectedPair(null);
      setReviewNotes('');
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleReview = () => {
    if (selectedPair) {
      markReviewedMutation.mutate({
        submission1Id: selectedPair.submission1.id,
        submission2Id: selectedPair.submission2.id,
        notes: reviewNotes,
      });
    }
  };
  
  const getSeverityColor = (score: number) => {
    if (score >= 0.95) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    if (score >= 0.9) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
    if (score >= 0.85) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
  };
  
  const getSeverityLabel = (score: number) => {
    if (score >= 0.95) return 'Critical';
    if (score >= 0.9) return 'High';
    if (score >= 0.85) return 'Medium';
    return 'Low';
  };
  
  const results = similarityData?.results || [];
  const hasResults = results.length > 0;
  
  return (
    <Card className="h-full" data-testid="similarity-panel">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Trust but Verify
            </CardTitle>
            <CardDescription className="mt-1">
              Plagiarism detection using TF-IDF similarity analysis
            </CardDescription>
          </div>
          <Button
            onClick={analyzeSubmissions}
            disabled={isAnalyzing}
            data-testid="button-run-analysis"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileSearch className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasResults && !isLoading ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No Analysis Results</AlertTitle>
            <AlertDescription>
              Click "Run Analysis" to scan submissions for potential plagiarism. 
              The system will compare all submissions and flag pairs with similarity ≥80%.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {hasResults && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Found {results.length} potential matches</span>
                <span>•</span>
                <span>{results.filter((r: SimilarityResult) => r.reviewed).length} reviewed</span>
                <span>•</span>
                <span>{results.filter((r: SimilarityResult) => !r.reviewed).length} pending review</span>
              </div>
            )}
            
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {results.map((result: SimilarityResult, index: number) => (
                  <motion.div
                    key={`${result.submission1.id}-${result.submission2.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`border-l-4 ${result.reviewed ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getSeverityColor(result.similarityScore)}>
                              <Copy className="h-3 w-3 mr-1" />
                              {result.percentageMatch}% Match
                            </Badge>
                            <Badge variant="outline">
                              {getSeverityLabel(result.similarityScore)} Severity
                            </Badge>
                            {result.reviewed && (
                              <Badge variant="secondary">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Reviewed
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-sm">{result.submission1.title}</h4>
                              <p className="text-xs text-muted-foreground">by {result.submission1.teamName}</p>
                            </div>
                            {result.submission1.snippet && (
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                {result.submission1.snippet}...
                              </p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-sm">{result.submission2.title}</h4>
                              <p className="text-xs text-muted-foreground">by {result.submission2.teamName}</p>
                            </div>
                            {result.submission2.snippet && (
                              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                {result.submission2.snippet}...
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {result.detectedAt && (
                              <span>Detected: {new Date(result.detectedAt).toLocaleDateString()}</span>
                            )}
                            {result.reviewedBy && (
                              <span className="ml-3">Reviewed by: {result.reviewedBy}</span>
                            )}
                          </div>
                          
                          {!result.reviewed && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPair(result)}
                                  data-testid={`button-review-${index}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Review Similarity Match</DialogTitle>
                                  <DialogDescription>
                                    Review this potential plagiarism case and add notes for the record.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-1">{result.submission1.title}</h4>
                                      <p className="text-xs text-muted-foreground">{result.submission1.teamName}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm mb-1">{result.submission2.title}</h4>
                                      <p className="text-xs text-muted-foreground">{result.submission2.teamName}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-center">
                                    <Badge className={`${getSeverityColor(result.similarityScore)} text-lg px-4 py-2`}>
                                      {result.percentageMatch}% Similarity
                                    </Badge>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Review Notes</label>
                                    <Textarea
                                      placeholder="Add your review notes here..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      rows={4}
                                      className="mt-1"
                                      data-testid="textarea-review-notes"
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button onClick={handleReview} data-testid="button-save-review">
                                      Mark as Reviewed
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        
                        {result.reviewNotes && (
                          <div className="mt-3 p-3 bg-muted rounded">
                            <p className="text-xs font-medium mb-1">Review Notes:</p>
                            <p className="text-xs text-muted-foreground">{result.reviewNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
            
            {hasResults && (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Analysis Methodology</AlertTitle>
                <AlertDescription className="text-xs">
                  This system uses TF-IDF (Term Frequency-Inverse Document Frequency) vectorization 
                  with cosine similarity to detect potential plagiarism. It analyzes submission titles, 
                  descriptions, and README files from public repositories. Pairs with ≥80% similarity 
                  are flagged for manual review.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}