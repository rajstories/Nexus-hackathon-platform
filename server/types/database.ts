// SQL Database Types (Azure SQL Database)
export interface User {
  id: string;
  firebase_uid?: string;
  name: string;
  email: string;
  role: 'participant' | 'organizer' | 'judge';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  registration_deadline: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface Submission {
  id: string;
  team_id: string;
  title: string;
  description?: string;
  repository_url?: string;
  demo_url?: string;
  video_url?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export interface Judge {
  id: string;
  event_id: string;
  user_id: string;
  assigned_at: string;
}

export interface Score {
  id: string;
  judge_id: string;
  submission_id: string;
  criteria: string;
  score: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface Track {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  event_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}