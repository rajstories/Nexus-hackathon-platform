import { seedDemoData } from "./demo";

console.log("🚀 Starting demo data seeding...");

seedDemoData()
  .then((result) => {
    console.log("✅ Demo seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`  - Event: ${result.event.title}`);
    console.log(`  - Organizer: ${result.organizer.email}`);
    console.log(`  - Participants: ${result.participants.length}`);
    console.log(`  - Teams: ${result.teams.length}`);
    console.log(`  - Submissions: ${result.submissions.length}`);
    console.log(`  - Judges: ${result.judges.length}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Demo seeding failed:", error);
    process.exit(1);
  });