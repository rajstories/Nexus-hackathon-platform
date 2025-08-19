import { query, closePool } from './sql';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Generate unique invite codes
    const generateInviteCode = (): string => {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Seed Users
    console.log('Seeding users...');
    const userIds: string[] = [];
    
    const users = [
      { email: 'alice@example.com', name: 'Alice Johnson', role: 'participant' },
      { email: 'bob@example.com', name: 'Bob Smith', role: 'participant' },
      { email: 'charlie@example.com', name: 'Charlie Brown', role: 'participant' },
      { email: 'diana@example.com', name: 'Diana Prince', role: 'participant' },
      { email: 'judge1@example.com', name: 'Prof. Emily Davis', role: 'judge' },
      { email: 'judge2@example.com', name: 'Dr. Michael Chen', role: 'judge' },
      { email: 'admin@example.com', name: 'Admin User', role: 'admin' }
    ];

    for (const user of users) {
      const result = await query(`
        INSERT INTO users (email, name, role)
        OUTPUT INSERTED.id
        VALUES (@email, @name, @role)
      `, user);
      userIds.push(result.recordset[0].id);
    }

    console.log(`✅ Created ${users.length} users`);

    // Seed Event
    console.log('Seeding event...');
    const eventResult = await query(`
      INSERT INTO events (title, description, mode, start_at, end_at)
      OUTPUT INSERTED.id
      VALUES (@title, @description, @mode, @start_at, @end_at)
    `, {
      title: 'Fusion X Hackathon 2025',
      description: 'A cutting-edge hackathon focusing on AI, Web3, and sustainable technology solutions. Join us for 48 hours of innovation, collaboration, and building the future.',
      mode: 'hybrid',
      start_at: new Date('2025-09-15T09:00:00Z'),
      end_at: new Date('2025-09-17T18:00:00Z')
    });

    const eventId = eventResult.recordset[0].id;
    console.log('✅ Created event');

    // Seed Tracks
    console.log('Seeding tracks...');
    const tracks = [
      { event_id: eventId, name: 'AI & Machine Learning' },
      { event_id: eventId, name: 'Web3 & Blockchain' },
      { event_id: eventId, name: 'Sustainability & Climate Tech' },
      { event_id: eventId, name: 'Healthcare Innovation' },
      { event_id: eventId, name: 'Education Technology' }
    ];

    for (const track of tracks) {
      await query(`
        INSERT INTO tracks (event_id, name)
        VALUES (@event_id, @name)
      `, track);
    }

    console.log(`✅ Created ${tracks.length} tracks`);

    // Seed Teams
    console.log('Seeding teams...');
    const teamIds: string[] = [];
    const teams = [
      { event_id: eventId, name: 'Neural Pioneers', invite_code: generateInviteCode() },
      { event_id: eventId, name: 'Blockchain Builders', invite_code: generateInviteCode() },
      { event_id: eventId, name: 'Green Innovators', invite_code: generateInviteCode() }
    ];

    for (const team of teams) {
      const result = await query(`
        INSERT INTO teams (event_id, name, invite_code)
        OUTPUT INSERTED.id
        VALUES (@event_id, @name, @invite_code)
      `, team);
      teamIds.push(result.recordset[0].id);
    }

    console.log(`✅ Created ${teams.length} teams`);

    // Seed Team Members
    console.log('Seeding team members...');
    const teamMemberships = [
      { team_id: teamIds[0], user_id: userIds[0], role: 'leader' },  // Alice -> Neural Pioneers
      { team_id: teamIds[0], user_id: userIds[1], role: 'member' },  // Bob -> Neural Pioneers
      { team_id: teamIds[1], user_id: userIds[2], role: 'leader' },  // Charlie -> Blockchain Builders
      { team_id: teamIds[1], user_id: userIds[3], role: 'member' },  // Diana -> Blockchain Builders
      { team_id: teamIds[2], user_id: userIds[0], role: 'member' },  // Alice also in Green Innovators
    ];

    for (const membership of teamMemberships) {
      await query(`
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (@team_id, @user_id, @role)
      `, membership);
    }

    console.log(`✅ Created ${teamMemberships.length} team memberships`);

    // Seed Judges
    console.log('Seeding judges...');
    const judgeIds: string[] = [];
    const judgeAssignments = [
      { user_id: userIds[4], event_id: eventId }, // Prof. Emily Davis
      { user_id: userIds[5], event_id: eventId }  // Dr. Michael Chen
    ];

    for (const judge of judgeAssignments) {
      const result = await query(`
        INSERT INTO judges (user_id, event_id)
        OUTPUT INSERTED.id
        VALUES (@user_id, @event_id)
      `, judge);
      judgeIds.push(result.recordset[0].id);
    }

    console.log(`✅ Created ${judgeAssignments.length} judges`);

    // Seed Submissions
    console.log('Seeding submissions...');
    const submissionIds: string[] = [];
    const submissions = [
      {
        team_id: teamIds[0],
        event_id: eventId,
        title: 'AI-Powered Code Review Assistant',
        repo_url: 'https://github.com/neural-pioneers/ai-code-review',
        demo_url: 'https://ai-code-review-demo.vercel.app',
        blob_path: '/uploads/neural-pioneers-demo.zip',
        round: 1
      },
      {
        team_id: teamIds[1],
        event_id: eventId,
        title: 'Decentralized Carbon Credit Marketplace',
        repo_url: 'https://github.com/blockchain-builders/carbon-credits',
        demo_url: 'https://carbon-credits-dapp.netlify.app',
        blob_path: '/uploads/blockchain-builders-demo.zip',
        round: 1
      }
    ];

    for (const submission of submissions) {
      const result = await query(`
        INSERT INTO submissions (team_id, event_id, title, repo_url, demo_url, blob_path, round)
        OUTPUT INSERTED.id
        VALUES (@team_id, @event_id, @title, @repo_url, @demo_url, @blob_path, @round)
      `, submission);
      submissionIds.push(result.recordset[0].id);
    }

    console.log(`✅ Created ${submissions.length} submissions`);

    // Seed Scores
    console.log('Seeding scores...');
    const criteria = ['innovation', 'technical_implementation', 'design', 'impact'];
    let scoreCount = 0;

    for (const submissionId of submissionIds) {
      for (const judgeId of judgeIds) {
        for (const criterion of criteria) {
          const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
          await query(`
            INSERT INTO scores (submission_id, judge_id, criteria, score, feedback, round)
            VALUES (@submission_id, @judge_id, @criteria, @score, @feedback, @round)
          `, {
            submission_id: submissionId,
            judge_id: judgeId,
            criteria: criterion,
            score: score,
            feedback: `Great work on ${criterion}. Score: ${score}/100`,
            round: 1
          });
          scoreCount++;
        }
      }
    }

    console.log(`✅ Created ${scoreCount} scores`);

    // Seed Announcements
    console.log('Seeding announcements...');
    const announcements = [
      {
        event_id: eventId,
        message: '🎉 Welcome to Fusion X Hackathon 2025! Check-in begins at 9:00 AM.'
      },
      {
        event_id: eventId,
        message: '⏰ Reminder: Submission deadline is tomorrow at 6:00 PM. Good luck teams!'
      },
      {
        event_id: eventId,
        message: '🍕 Lunch is being served in the main hall. Vegetarian and vegan options available.'
      }
    ];

    for (const announcement of announcements) {
      await query(`
        INSERT INTO announcements (event_id, message)
        VALUES (@event_id, @message)
      `, announcement);
    }

    console.log(`✅ Created ${announcements.length} announcements`);

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log(`• Users: ${users.length}`);
    console.log(`• Events: 1`);
    console.log(`• Tracks: ${tracks.length}`);
    console.log(`• Teams: ${teams.length}`);
    console.log(`• Team Members: ${teamMemberships.length}`);
    console.log(`• Judges: ${judgeAssignments.length}`);
    console.log(`• Submissions: ${submissions.length}`);
    console.log(`• Scores: ${scoreCount}`);
    console.log(`• Announcements: ${announcements.length}`);

    console.log('\n🎉 Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };