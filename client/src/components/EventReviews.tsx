import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, User, Shield, Award, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Review {
  id: string;
  rating: number;
  body: string;
  role: 'participant' | 'judge' | 'organizer';
  created_at: string;
  author: {
    name: string;
    verified: boolean;
  };
}

interface ReviewStats {
  average: number | null;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verified_count: number;
  recent_reviews: Review[];
}

interface EventReviewsProps {
  eventId: string;
  userRole?: 'participant' | 'judge' | 'organizer';
  authToken?: string;
  className?: string;
}

export function EventReviews({ eventId, userRole, authToken, className }: EventReviewsProps) {
  const [reviews, setReviews] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const { toast } = useToast();

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/reviews`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const submitReview = async () => {
    if (!userRole || !authToken) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to submit a review',
        variant: 'destructive',
      });
      return;
    }

    if (reviewForm.body.length < 10) {
      toast({
        title: 'Invalid Review',
        description: 'Review must be at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/events/${eventId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });

      setShowReviewForm(false);
      setReviewForm({ rating: 5, body: '' });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update review
  const updateReview = async () => {
    if (!userRole || !authToken) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/events/${eventId}/reviews/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }

      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });

      setEditingReview(null);
      setReviewForm({ rating: 5, body: '' });
      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete review (organizer only)
  const deleteReview = async (reviewId: string) => {
    if (userRole !== 'organizer' || !authToken) return;

    try {
      const response = await fetch(`/api/events/${eventId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }

      toast({
        title: 'Success',
        description: 'Review deleted successfully',
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
    }
  };

  // Render star rating
  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
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

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'organizer':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'judge':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'participant':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Event Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="event-reviews">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Event Reviews
            {reviews && reviews.verified_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {reviews.verified_count} verified
              </Badge>
            )}
          </CardTitle>
          
          {userRole && (
            <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-write-review">
                  <Edit className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    {renderStars(reviewForm.rating, true, (rating) =>
                      setReviewForm({ ...reviewForm, rating })
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Review</label>
                    <Textarea
                      value={reviewForm.body}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewForm({ ...reviewForm, body: e.target.value })}
                      placeholder="Share your experience with this event..."
                      className="min-h-[100px]"
                      data-testid="textarea-review-body"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {reviewForm.body.length}/2000 characters (minimum 10)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={submitReview}
                      disabled={submitting || reviewForm.body.length < 10}
                      data-testid="button-submit-review"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      data-testid="button-cancel-review"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!reviews || reviews.verified_count === 0 ? (
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              No verified reviews yet. Only participants, judges, and organizers can review events.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Review Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" data-testid="text-average-rating">
                  {reviews.average ? reviews.average.toFixed(1) : 'N/A'}
                </div>
                {reviews.average && renderStars(Math.round(reviews.average))}
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {reviews.verified_count} verified review{reviews.verified_count !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.distribution[rating as keyof typeof reviews.distribution];
                  const percentage = reviews.verified_count > 0 ? (count / reviews.verified_count) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews */}
            <div>
              <h3 className="font-semibold mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                <AnimatePresence>
                  {reviews.recent_reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      data-testid={`review-${review.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(review.role)}
                            <span className="font-medium">{review.author.name}</span>
                          </div>
                          <Badge className={getRoleBadgeColor(review.role)}>
                            {review.role}
                          </Badge>
                          {review.author.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </div>
                          {userRole === 'organizer' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteReview(review.id)}
                              className="text-red-500 hover:text-red-700"
                              data-testid={`button-delete-review-${review.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        {renderStars(review.rating)}
                      </div>
                      
                      <p className="text-sm leading-relaxed" data-testid={`text-review-body-${review.id}`}>
                        {review.body}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}