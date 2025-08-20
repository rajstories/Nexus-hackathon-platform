import { db } from "../server/db";
import { 
  users, 
  events, 
  teams, 
  teamMembers, 
  submissions, 
  judgeAssignments, 
  evaluationCriteria, 
  scores 
} from "../shared/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'hackathon-demo'
  });
}

const generateUniqueFirebaseUid = () => `demo_${uuidv4()}`;

export async function seedDemoData() {
  console.log("🚀 Starting demo data seeding...");
  
  try {
    // Clear existing demo data
    await clearDemoData();
    
    // Create demo organizer
    const [organizer] = await db.insert(users).values({
      firebaseUid: 'demo_organizer',
      name: 'Demo Organizer',
      email: 'organizer@demo.hackathon',
      role: 'organizer'
    }).returning();
    console.log("✅ Created organizer");

    // Create event
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 48 * 60 * 60 * 1000); // 48 hours later
    
    const [event] = await db.insert(events).values({
      title: 'Demo Hackathon 2024',
      description: 'An exciting demo hackathon to showcase the platform capabilities!',
      mode: 'hybrid',
      startAt: startDate,
      endAt: endDate,
      organizerId: organizer.id
    }).returning();
    console.log("✅ Created event");

    // Create 3 tracks (evaluation criteria)
    const tracks = [
      { name: 'Innovation', description: 'How innovative and creative is the solution?', weight: '0.35' },
      { name: 'Technical Excellence', description: 'Quality of code and technical implementation', weight: '0.35' },
      { name: 'Presentation', description: 'Quality of demo and pitch', weight: '0.30' }
    ];

    const criteriaIds = [];
    for (let i = 0; i < tracks.length; i++) {
      const [criteria] = await db.insert(evaluationCriteria).values({
        eventId: event.id,
        name: tracks[i].name,
        description: tracks[i].description,
        maxScore: 10,
        weight: tracks[i].weight,
        displayOrder: i
      }).returning();
      criteriaIds.push(criteria);
    }
    console.log("✅ Created 3 evaluation tracks");

    // Create 3 judges
    const judges = [];
    for (let i = 1; i <= 3; i++) {
      const [judge] = await db.insert(users).values({
        firebaseUid: `demo_judge_${i}`,
        name: `Judge ${i}`,
        email: `judge${i}@demo.hackathon`,
        role: 'judge'
      }).returning();
      judges.push(judge);
      
      // Assign judge to event
      await db.insert(judgeAssignments).values({
        eventId: event.id,
        judgeId: judge.id
      });
    }
    console.log("✅ Created 3 judges and assigned to event");

    // Create 20 participants
    const participants = [];
    const participantNames = [
      'Alex Chen', 'Sarah Johnson', 'Mike Davis', 'Emily Wilson',
      'David Lee', 'Jessica Brown', 'Ryan Martinez', 'Lisa Anderson',
      'Kevin Taylor', 'Maria Garcia', 'Chris Thomas', 'Amanda Moore',
      'Jason White', 'Nicole Harris', 'Tom Robinson', 'Rachel Clark',
      'Steven Lewis', 'Jennifer Hall', 'Mark Allen', 'Ashley Young'
    ];

    for (let i = 0; i < 20; i++) {
      const [participant] = await db.insert(users).values({
        firebaseUid: generateUniqueFirebaseUid(),
        name: participantNames[i],
        email: `${participantNames[i].toLowerCase().replace(' ', '.')}@demo.hackathon`,
        role: 'participant'
      }).returning();
      participants.push(participant);
    }
    console.log("✅ Created 20 participants");

    // Create 6 teams with members
    const teamNames = [
      'Code Warriors', 'Tech Titans', 'Innovation Squad',
      'Digital Dreamers', 'Byte Brigade', 'Quantum Coders'
    ];
    
    const createdTeams = [];
    let participantIndex = 0;
    
    for (let i = 0; i < 6; i++) {
      const teamLead = participants[participantIndex++];
      
      const [team] = await db.insert(teams).values({
        eventId: event.id,
        name: teamNames[i],
        inviteCode: `DEMO${(1000 + i).toString()}`,
        createdById: teamLead.id
      }).returning();
      createdTeams.push(team);
      
      // Add team lead as member
      await db.insert(teamMembers).values({
        teamId: team.id,
        userId: teamLead.id
      });
      
      // Add 2-3 more members to each team (some participants may not be in teams)
      const memberCount = i < 4 ? 3 : 2; // First 4 teams get 3 additional members, last 2 get 2
      for (let j = 0; j < memberCount && participantIndex < participants.length; j++) {
        await db.insert(teamMembers).values({
          teamId: team.id,
          userId: participants[participantIndex++].id
        });
      }
    }
    console.log("✅ Created 6 teams with members");

    // Create 10 submissions (not all teams submit)
    const projectTitles = [
      'AI-Powered Code Review Assistant',
      'Real-time Collaboration Platform',
      'Smart Energy Management System',
      'Healthcare Data Analytics Dashboard',
      'Blockchain-based Supply Chain Tracker',
      'AR Educational Learning App',
      'IoT Smart Home Controller',
      'ML-based Fraud Detection System',
      'Cloud-native Task Automation Tool',
      'Green Tech Carbon Footprint Calculator'
    ];

    const submittedTeams = createdTeams.slice(0, 5); // First 5 teams submit
    const doubleSubmitTeam = createdTeams[0]; // First team submits twice
    
    const createdSubmissions = [];
    
    // First 5 teams submit once
    for (let i = 0; i < 5; i++) {
      const [teamLeadMember] = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, submittedTeams[i].id))
        .limit(1);
      
      const [submission] = await db.insert(submissions).values({
        teamId: submittedTeams[i].id,
        eventId: event.id,
        title: projectTitles[i],
        repoUrl: `https://github.com/demo/${projectTitles[i].toLowerCase().replace(/\s+/g, '-')}`,
        demoUrl: `https://demo-${i + 1}.hackathon.demo`,
        submittedById: teamLeadMember.userId
      }).returning();
      createdSubmissions.push(submission);
    }
    
    // First team submits 5 more projects (total of 10 submissions)
    for (let i = 5; i < 10; i++) {
      const [teamLeadMember] = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, doubleSubmitTeam.id))
        .limit(1);
      
      const [submission] = await db.insert(submissions).values({
        teamId: doubleSubmitTeam.id,
        eventId: event.id,
        title: projectTitles[i],
        repoUrl: `https://github.com/demo/${projectTitles[i].toLowerCase().replace(/\s+/g, '-')}`,
        demoUrl: `https://demo-${i + 1}.hackathon.demo`,
        submittedById: teamLeadMember.userId
      }).returning();
      createdSubmissions.push(submission);
    }
    console.log("✅ Created 10 submissions");

    // Add random scores from judges
    for (const submission of createdSubmissions) {
      for (const judge of judges) {
        for (const criteria of criteriaIds) {
          // Random score between 5 and 10
          const score = (Math.random() * 5 + 5).toFixed(2);
          
          await db.insert(scores).values({
            submissionId: submission.id,
            judgeId: judge.id,
            criteriaId: criteria.id,
            round: 1,
            score: score,
            feedback: generateRandomFeedback(parseFloat(score))
          });
        }
      }
    }
    console.log("✅ Added random scores from judges");

    console.log("🎉 Demo data seeding completed successfully!");
    return {
      event,
      organizer,
      judges,
      teams: createdTeams,
      participants,
      submissions: createdSubmissions
    };
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}

async function clearDemoData() {
  console.log("🧹 Clearing existing demo data...");
  
  try {
    // Delete in reverse order of dependencies
    await db.delete(scores);
    await db.delete(submissions);
    await db.delete(teamMembers);
    await db.delete(teams);
    await db.delete(judgeAssignments);
    await db.delete(evaluationCriteria);
    await db.delete(events);
    await db.delete(users);
    
    console.log("✅ Cleared all demo data");
  } catch (error) {
    console.error("❌ Error clearing demo data:", error);
    throw error;
  }
}

function generateRandomFeedback(score: number): string {
  const feedbackOptions = {
    high: [
      "Excellent work! The implementation shows great understanding.",
      "Outstanding solution with innovative approach.",
      "Very impressive technical execution and creativity.",
      "Strong implementation with clear attention to detail."
    ],
    medium: [
      "Good effort with room for improvement in some areas.",
      "Solid foundation with potential for enhancement.",
      "Nice approach, consider refining the implementation.",
      "Decent work, could benefit from more polish."
    ],
    low: [
      "Basic implementation that meets minimum requirements.",
      "Needs more work on core functionality.",
      "Consider revisiting the approach for better results.",
      "Foundation is there but requires significant improvement."
    ]
  };

  if (score >= 8) {
    return feedbackOptions.high[Math.floor(Math.random() * feedbackOptions.high.length)];
  } else if (score >= 6.5) {
    return feedbackOptions.medium[Math.floor(Math.random() * feedbackOptions.medium.length)];
  } else {
    return feedbackOptions.low[Math.floor(Math.random() * feedbackOptions.low.length)];
  }
}

// Run if executed directly
// Note: To run this script directly, use: tsx scripts/demo.ts

export { clearDemoData };