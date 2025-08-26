import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, AlertTriangle, Shield, User, Award, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FlaggedReview {
  flag: {
    reason: 'outlier_rating' | 'invalid_user' | 'suspicious_pattern';
    score?: number;
    metadata?: {
      madScore?: number;
      eventAverageRating?: number;
      userRole?: string;
      detectionMethod?: string;
    };
    flaggedAt: string;
  };
  review: {
    id: string;
    rating: number;
    body: string;
    role: string;
    createdAt: string;
    userName: string;
    userEmail: string;
  } | null;
}

interface FlaggedReviewsData {
  event_id: string;
  flagged_count: number;
  flags: FlaggedReview[];
}

interface FlaggedReviewsModalProps {
  eventId: string;
  authToken?: string;
  className?: string;
}

export function FlaggedReviewsModal({ eventId, authToken, className }: FlaggedReviewsModalProps) {
  const [flaggedReviews, setFlaggedReviews] = useState<FlaggedReviewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Fetch flagged reviews
  const fetchFlaggedReviews = async () => {
    if (!authToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view flagged reviews',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/reviews/flags`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Only event organizers can view flagged reviews');
        }
        throw new Error('Failed to fetch flagged reviews');
      }

      const data = await response.json();
      setFlaggedReviews(data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load flagged reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual analysis
  const triggerAnalysis = async () => {
    if (!authToken) return;

    try {
      setAnalyzing(true);
      const response = await fetch(`/api/events/${eventId}/reviews/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger analysis');
      }

      toast({
        title: 'Analysis Complete',
        description: 'Review flagging analysis has been completed',
      });

      // Refresh flagged reviews
      await fetchFlaggedReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to trigger analysis',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Get flag reason display text
  const getFlagReasonText = (reason: string) => {
    switch (reason) {
      case 'outlier_rating':
        return 'Outlier Rating';
      case 'invalid_user':
        return 'Invalid User';
      case 'suspicious_pattern':
        return 'Suspicious Pattern';
      default:
        return reason;
    }
  };

  // Get flag reason color
  const getFlagReasonColor = (reason: string) => {
    switch (reason) {
      case 'outlier_rating':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'invalid_user':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'suspicious_pattern':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'judge':
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'participant':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Auto-fetch when dialog opens
  useEffect(() => {
    if (open) {
      fetchFlaggedReviews();
    }
  }, [open, eventId, authToken]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className} data-testid="button-view-flagged-reviews">
          <Flag className="h-4 w-4 mr-2" />
          View Flagged Reviews
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Flagged Reviews - Moderation Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchFlaggedReviews}
                disabled={loading}
                size="sm"
                variant="outline"
                data-testid="button-refresh-flags"
              >
                <Refresh className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                onClick={triggerAnalysis}
                disabled={analyzing}
                size="sm"
                data-testid="button-trigger-analysis"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {analyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>

            {flaggedReviews && (
              <Badge variant="secondary" data-testid="badge-flagged-count">
                {flaggedReviews.flagged_count} flagged review{flaggedReviews.flagged_count !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && flaggedReviews && flaggedReviews.flagged_count === 0 && (
            <Alert data-testid="alert-no-flags">
              <Flag className="h-4 w-4" />
              <AlertDescription>
                No flagged reviews found. All reviews appear to be legitimate based on our analysis.
              </AlertDescription>
            </Alert>
          )}

          {/* Flagged Reviews */}
          {!loading && flaggedReviews && flaggedReviews.flagged_count > 0 && (
            <div className="space-y-4">
              <AnimatePresence>
                {flaggedReviews.flags.map((flaggedReview, index) => (
                  <motion.div
                    key={`${flaggedReview.review?.id}-${flaggedReview.flag.reason}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-red-500" data-testid={`flagged-review-${index}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getFlagReasonColor(flaggedReview.flag.reason)}>
                              {getFlagReasonText(flaggedReview.flag.reason)}
                            </Badge>
                            
                            {flaggedReview.flag.score && (
                              <Badge variant="outline">
                                Score: {flaggedReview.flag.score.toFixed(2)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Flagged: {format(new Date(flaggedReview.flag.flaggedAt), 'MMM d, yyyy HH:mm')}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {flaggedReview.review ? (
                          <>
                            {/* Review Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(flaggedReview.review.role)}
                                <span className="font-medium">{flaggedReview.review.userName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {flaggedReview.review.role}
                                </Badge>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-2xl font-bold">
                                  {flaggedReview.review.rating}/5
                                </div>
                                <div className="text-xs text-muted-foreground">Rating</div>
                              </div>
                              
                              <div className="text-right text-sm text-muted-foreground">
                                {format(new Date(flaggedReview.review.createdAt), 'MMM d, yyyy HH:mm')}
                              </div>
                            </div>
                            
                            {/* Review Body */}
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                              <p className="text-sm leading-relaxed" data-testid={`review-body-${index}`}>
                                "{flaggedReview.review.body}"
                              </p>
                            </div>
                            
                            {/* Flag Metadata */}
                            {flaggedReview.flag.metadata && (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                <h4 className="font-medium text-sm mb-2">Detection Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  {flaggedReview.flag.metadata.madScore && (
                                    <div>
                                      <span className="font-medium">MAD Z-Score:</span> {flaggedReview.flag.metadata.madScore.toFixed(3)}
                                    </div>
                                  )}
                                  {flaggedReview.flag.metadata.eventAverageRating && (
                                    <div>
                                      <span className="font-medium">Event Average:</span> {flaggedReview.flag.metadata.eventAverageRating.toFixed(1)}
                                    </div>
                                  )}
                                  {flaggedReview.flag.metadata.detectionMethod && (
                                    <div className="col-span-2">
                                      <span className="font-medium">Method:</span> {flaggedReview.flag.metadata.detectionMethod}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Review data not found. This review may have been deleted.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}