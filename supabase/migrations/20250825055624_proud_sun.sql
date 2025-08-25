/*
  # Cricket Auction Database Schema

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `max_players` (integer)
      - `max_teams` (integer) 
      - `points_per_team` (integer)
      - `status` (enum: draft, active, completed)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `teams`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `name` (text)
      - `owner_name` (text)
      - `logo_url` (text, nullable)
      - `remaining_points` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `players`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, foreign key)
      - `name` (text)
      - `position` (text)
      - `base_price` (integer)
      - `image_url` (text, nullable)
      - `is_icon` (boolean)
      - `status` (enum: available, sold, unsold)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `team_players`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key)
      - `player_id` (uuid, foreign key)
      - `purchase_price` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a demo)
*/

-- Create enum types
CREATE TYPE tournament_status AS ENUM ('draft', 'active', 'completed');
CREATE TYPE player_status AS ENUM ('available', 'sold', 'unsold');

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_players integer NOT NULL DEFAULT 100,
  max_teams integer NOT NULL DEFAULT 8,
  points_per_team integer NOT NULL DEFAULT 1000,
  status tournament_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner_name text NOT NULL,
  logo_url text,
  remaining_points integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  position text NOT NULL,
  base_price integer NOT NULL DEFAULT 50,
  image_url text,
  is_icon boolean DEFAULT false,
  status player_status DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_players junction table
CREATE TABLE IF NOT EXISTS team_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  purchase_price integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
CREATE POLICY "Public access to tournaments" ON tournaments FOR ALL USING (true);
CREATE POLICY "Public access to teams" ON teams FOR ALL USING (true);
CREATE POLICY "Public access to players" ON players FOR ALL USING (true);
CREATE POLICY "Public access to team_players" ON team_players FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_teams_tournament_id ON teams(tournament_id);
CREATE INDEX idx_players_tournament_id ON players(tournament_id);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_team_players_team_id ON team_players(team_id);
CREATE INDEX idx_team_players_player_id ON team_players(player_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();