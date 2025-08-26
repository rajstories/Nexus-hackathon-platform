#!/usr/bin/env tsx
import { db } from '../db';
import { eventReviews, events, users, teams, teamMembers } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { ReviewFlaggingService } from '../services/ReviewFlaggingService';

interface TestReview {
  rating: number;
  body: string;
  role: 'participant' | 'judge' | 'organizer';
}

// Sample reviews including obvious outliers
const testReviews: TestReview[] = [
  // Normal reviews (around 3-4 rating)
  { rating: 4, body: 'Great event with well-organized sessions and helpful mentors. The challenges were appropriately difficult.', role: 'participant' },
  { rating: 3, body: 'Good hackathon overall, though the schedule was a bit tight. Enjoyed the networking opportunities.', role: 'participant' },
  { rating: 4, body: 'Well-structured event with clear judging criteria. Participants showed great enthusiasm.', role: 'judge' },
  { rating: 3, body: 'Decent organization, could improve on technical support and venue facilities.', role: 'participant' },
  { rating: 4, body: 'Excellent diversity of projects and creative solutions. Judging process was fair and transparent.', role: 'judge' },
  { rating: 3, body: 'Good learning experience with valuable feedback from judges. Food and venue were adequate.', role: 'participant' },
  
  // Outliers - very high ratings (potential fake positive reviews)
  { rating: 5, body: 'Amazing event!!!', role: 'participant' }, // Short content for high rating
  { rating: 5, body: 'Perfect in every way! Best hackathon ever! 10/10 would recommend!', role: 'participant' },
  { rating: 5, body: 'Incredible experience', role: 'participant' }, // Very short
  
  // Outliers - very low ratings (potential fake negative reviews)  
  { rating: 1, body: 'Worst event ever. Complete waste of time and poorly organized in every aspect.', role: 'participant' },
  { rating: 1, body: 'Terrible experience with unprofessional staff and unrealistic expectations.', role: 'participant' },
  { rating: 2, body: 'Bad.', role: 'participant' }, // Very short content for low rating
];

async function seedTestReviews() {
  try {
    console.log('🌱 Starting test review seeding...');

    // Get the first event
    const eventsList = await db.select().from(events).limit(1);
    if (!eventsList.length) {
      console.log('❌ No events found. Please create an event first.');
      return;
    }
    
    const event = eventsList[0];
    console.log(`📅 Using event: ${event.title} (${event.id})`);

    // Get some users
    const usersList = await db.select().from(users).limit(testReviews.length);
    if (usersList.length < 3) {
      console.log('❌ Need at least 3 users. Please create more users first.');
      return;
    }

    console.log(`👥 Found ${usersList.length} users for review seeding`);

    // Clear existing reviews for this event
    await db.delete(eventReviews).where(eq(eventReviews.eventId, event.id));
    console.log('🗑️  Cleared existing reviews');

    // Create test reviews
    let reviewCount = 0;
    for (let i = 0; i < Math.min(testReviews.length, usersList.length); i++) {
      const testReview = testReviews[i];
      const user = usersList[i];

      try {
        await db.insert(eventReviews).values({
          eventId: event.id,
          userId: user.id,
          rating: testReview.rating,
          body: testReview.body,
          role: testReview.role,
        });
        reviewCount++;
      } catch (error) {
        console.log(`⚠️  Failed to create review for user ${user.id}:`, error);
      }
    }

    console.log(`✅ Created ${reviewCount} test reviews`);

    // Run flagging analysis
    console.log('🚩 Running flagging analysis...');
    await ReviewFlaggingService.runFlaggingAnalysis(event.id);

    // Get flagged reviews
    const flaggedReviews = await ReviewFlaggingService.getFlaggedReviewsWithDetails(event.id);
    console.log(`🔍 Found ${flaggedReviews.length} flagged reviews:`);

    flaggedReviews.forEach((flaggedReview, index) => {
      const { flag, review } = flaggedReview;
      console.log(`${index + 1}. ${flag.reason} - Rating: ${review?.rating}, Score: ${flag.score?.toFixed(2)}`);
      if (flag.metadata?.madScore) {
        console.log(`   MAD Z-Score: ${flag.metadata.madScore.toFixed(2)}`);
      }
    });

    console.log('🎉 Test review seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding test reviews:', error);
    process.exit(1);
  }
}

// Run seeding when executed directly
seedTestReviews().then(() => {
  console.log('✨ Seeding process finished');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});

export { seedTestReviews };