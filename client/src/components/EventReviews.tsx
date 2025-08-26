import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, User, Shield, Award, MessageCircle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { io, Socket } from 'socket.io-client';

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
  isUserVerified?: boolean;
}

export function EventReviews({ eventId, userRole, authToken, className, isUserVerified = false }: EventReviewsProps) {
  const [reviews, setReviews] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '', poapCode: '' });
  const [userVerification, setUserVerification] = useState({ isVerified: false, loading: true });
  const [poapInfo, setPoapInfo] = useState<{ requirePoap: boolean; loading: boolean }>({ requirePoap: false, loading: true });
  const [showPoapModal, setShowPoapModal] = useState(false);
  const [poapClaimed, setPoapClaimed] = useState(false);
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);

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

  // Check if current user is verified for this event
  const checkUserVerification = async () => {
    if (!authToken) {
      setUserVerification({ isVerified: false, loading: false });
      return;
    }

    try {
      // For now, we'll use the passed userRole and isUserVerified prop
      // In a real implementation, you might call an API endpoint to verify
      setUserVerification({ 
        isVerified: isUserVerified || ['participant', 'judge', 'organizer'].includes(userRole || ''), 
        loading: false 
      });
    } catch (error) {
      setUserVerification({ isVerified: false, loading: false });
    }
  };

  // Fetch POAP information for the event
  const fetchPoapInfo = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/poap-info`);
      if (response.ok) {
        const data = await response.json();
        setPoapInfo({ requirePoap: data.data.require_poap, loading: false });
      } else {
        setPoapInfo({ requirePoap: false, loading: false });
      }
    } catch (error) {
      console.error('Error fetching POAP info:', error);
      setPoapInfo({ requirePoap: false, loading: false });
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
        body: JSON.stringify({
          rating: reviewForm.rating,
          body: reviewForm.body,
          ...(poapInfo.requirePoap && reviewForm.poapCode ? { poap_code: reviewForm.poapCode } : {})
        }),
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
      setReviewForm({ rating: 5, body: '', poapCode: '' });
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
      setReviewForm({ rating: 5, body: '', poapCode: '' });
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

  // Initialize Socket.IO connection for real-time updates
  useEffect(() => {
    if (!authToken) return;

    // Initialize Socket.IO connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;
    
    const socket = io(socketUrl, {
      auth: {
        token: authToken
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Join the event room for real-time updates
    socket.emit('join-event', eventId);

    // Listen for real-time review updates
    socket.on('review:new', (data: { review: Review; isUpdate: boolean; timestamp: string }) => {
      console.log('Received real-time review update:', data);
      
      if (data.isUpdate) {
        // Update existing review
        setReviews(prev => {
          if (!prev) return prev;
          
          const updatedReviews = prev.reviews.map(review => 
            review.id === data.review.id ? data.review : review
          );
          
          // Recalculate stats
          const newStats = calculateReviewStats(updatedReviews);
          
          return {
            ...prev,
            reviews: updatedReviews,
            ...newStats
          };
        });
      } else {
        // Add new review
        setReviews(prev => {
          if (!prev) return prev;
          
          const updatedReviews = [data.review, ...prev.reviews];
          const newStats = calculateReviewStats(updatedReviews);
          
          return {
            ...prev,
            reviews: updatedReviews,
            ...newStats
          };
        });
      }
    });

    socket.on('review:deleted', (data: { reviewId: string; rating: number; timestamp: string }) => {
      console.log('Received real-time review deletion:', data);
      
      setReviews(prev => {
        if (!prev) return prev;
        
        const updatedReviews = prev.reviews.filter(review => review.id !== data.reviewId);
        const newStats = calculateReviewStats(updatedReviews);
        
        return {
          ...prev,
          reviews: updatedReviews,
          ...newStats
        };
      });
    });

    socket.on('connect', () => {
      console.log('Socket connected for event:', eventId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected for event:', eventId);
    });

    return () => {
      socket.emit('leave-event', eventId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId, authToken]);

  useEffect(() => {
    fetchReviews();
    checkUserVerification();
    fetchPoapInfo();
  }, [eventId, authToken, userRole, isUserVerified]);

  // Helper function to calculate review statistics
  const calculateReviewStats = (reviewsList: Review[]) => {
    if (reviewsList.length === 0) {
      return {
        average: null,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verified_count: 0
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviewsList.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    return {
      average: totalRating / reviewsList.length,
      distribution,
      verified_count: reviewsList.length // All reviews are from verified users
    };
  };

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
    <div className="space-y-6">
      {/* Community Reviews Header Card */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Community Reviews</span>
            </div>
            {reviews && reviews.verified_count > 0 && (
              <Badge variant="secondary" className="ml-2">
                {reviews.verified_count} verified
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {reviews && reviews.average ? (
            <>
              {/* Big Average Rating */}
              <div className="space-y-3">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-average-rating">
                  {reviews.average.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(reviews.average))}
                </div>
                <p className="text-lg text-muted-foreground">
                  Based on {reviews.verified_count} verified review{reviews.verified_count !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution Bars */}
              <div className="max-w-md mx-auto space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.distribution[rating as keyof typeof reviews.distribution];
                  const percentage = reviews.verified_count > 0 ? (count / reviews.verified_count) * 100 : 0;
                  
                  return (
                    <motion.div 
                      key={rating} 
                      className="flex items-center gap-3 text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: (5 - rating) * 0.1 }}
                    >
                      <div className="flex items-center gap-1 w-12">
                        <span>{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ 
                            duration: 0.8, 
                            ease: "easeOut", 
                            delay: (5 - rating) * 0.1 + 0.2 
                          }}
                        />
                      </div>
                      <motion.span 
                        className="w-8 text-right font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: (5 - rating) * 0.1 + 0.6 }}
                      >
                        {count}
                      </motion.span>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No verified reviews yet</p>
              <p className="text-sm">Be the first to share your experience!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className={className} data-testid="event-reviews">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Reviews
            </CardTitle>
            
            {/* Review Form Button */}
            <TooltipProvider>
              {userVerification.isVerified ? (
                <>
                  {poapInfo.requirePoap && !poapClaimed ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowPoapModal(true)}
                      data-testid="button-claim-poap"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Claim POAP First
                    </Button>
                  ) : (
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
                      
                      {/* POAP Code Input (when POAP is required) */}
                      {poapInfo.requirePoap && (
                        <div>
                          <label className="text-sm font-medium mb-2 block">POAP Code</label>
                          <input
                            type="text"
                            value={reviewForm.poapCode}
                            onChange={(e) => setReviewForm({ ...reviewForm, poapCode: e.target.value })}
                            placeholder="Enter your POAP code for this event"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            data-testid="input-poap-code"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            POAP verification is required for this event
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={submitReview}
                          disabled={submitting || reviewForm.body.length < 10 || (poapInfo.requirePoap && !reviewForm.poapCode)}
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
                </>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled
                        className="opacity-50 cursor-not-allowed"
                        data-testid="button-write-review-disabled"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Write Review
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Only verified participants and judges can review</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
          
          {/* Verification Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Verification based on event participation records.</strong> Only participants, judges, and organizers who are verified for this event can submit reviews.
            </p>
          </div>
        </CardHeader>
      
        <CardContent className="space-y-4">
          {!reviews || reviews.verified_count === 0 ? (
            <Alert>
              <MessageCircle className="h-4 w-4" />
              <AlertDescription>
                No verified reviews yet. Only participants, judges, and organizers can review events.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reviews.recent_reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`review-${review.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(review.role)}
                          <span className="font-medium">{review.author.name}</span>
                        </div>
                        <Badge className={getRoleBadgeColor(review.role)} data-testid={`badge-role-${review.id}`}>
                          {review.role.charAt(0).toUpperCase() + review.role.slice(1)}
                        </Badge>
                        {review.author.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20" data-testid={`badge-verified-${review.id}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
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
                    
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300" data-testid={`text-review-body-${review.id}`}>
                      {review.body}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* POAP Claiming Modal */}
      <Dialog open={showPoapModal} onOpenChange={setShowPoapModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Claim Your POAP
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Proof of Attendance Required</h3>
              <p className="text-muted-foreground mb-4">
                This event requires a POAP (Proof of Attendance Protocol) to verify your participation before you can submit a review.
              </p>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Demo Code:</strong> HACKATHON2024
                  <br />
                  <span className="text-xs opacity-75">In production, this would be your actual POAP code</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPoapClaimed(true);
                  setShowPoapModal(false);
                  setShowReviewForm(true);
                  toast({
                    title: 'POAP Claimed!',
                    description: 'You can now submit your review for this event.',
                  });
                }}
                className="flex-1"
                data-testid="button-confirm-poap-claim"
              >
                I have my POAP code
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPoapModal(false)}
                data-testid="button-cancel-poap-claim"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}