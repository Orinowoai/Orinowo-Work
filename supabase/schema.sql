-- Orinowo Database Schema
-- This SQL file creates the complete database structure for the Orinowo platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'elite')),
    tracks_generated INTEGER DEFAULT 0,
    tracks_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Tracks table
CREATE TABLE tracks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    audio_url TEXT,
    genre TEXT,
    duration INTEGER, -- in seconds
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Spotlight entries table
CREATE TABLE spotlight (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('artist', 'song', 'producer')),
    description TEXT,
    image_url TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Competitions table
CREATE TABLE competitions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    prize_pool INTEGER, -- in cents
    max_entries INTEGER DEFAULT 1000,
    rules TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Competition entries table
CREATE TABLE entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
    entry_title TEXT NOT NULL,
    entry_description TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(competition_id, user_id) -- One entry per user per competition
);

-- Votes table
CREATE TABLE votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
    spotlight_id UUID REFERENCES spotlight(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    user_ip INET, -- For anonymous voting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CHECK (
        (entry_id IS NOT NULL AND spotlight_id IS NULL) OR 
        (entry_id IS NULL AND spotlight_id IS NOT NULL)
    ),
    UNIQUE(entry_id, user_id),
    UNIQUE(entry_id, user_ip),
    UNIQUE(spotlight_id, user_id),
    UNIQUE(spotlight_id, user_ip)
);

-- Competition winners table
CREATE TABLE winners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    entry_id UUID REFERENCES entries(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    prize_amount INTEGER, -- in cents
    announced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(competition_id, position),
    UNIQUE(competition_id, entry_id)
);

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    author TEXT NOT NULL,
    read_time INTEGER DEFAULT 5, -- estimated read time in minutes
    tags TEXT[] DEFAULT '{}',
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Merch interest table (waitlist)
CREATE TABLE merch_interest (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    product_interest TEXT[],
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(email)
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_interest ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tracks policies
CREATE POLICY "Public tracks are viewable by everyone" ON tracks FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own tracks" ON tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tracks" ON tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tracks" ON tracks FOR UPDATE USING (auth.uid() = user_id);

-- Spotlight policies (public read, admin write)
CREATE POLICY "Everyone can view active spotlight entries" ON spotlight FOR SELECT USING (active = true);
CREATE POLICY "Authenticated users can insert spotlight entries" ON spotlight FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Competitions policies (public read)
CREATE POLICY "Everyone can view active competitions" ON competitions FOR SELECT USING (active = true);

-- Entries policies
CREATE POLICY "Everyone can view competition entries" ON entries FOR SELECT USING (true);
CREATE POLICY "Users can insert their own entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Votes policies (public read and write with restrictions)
CREATE POLICY "Everyone can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
);

-- Winners policies (public read)
CREATE POLICY "Everyone can view winners" ON winners FOR SELECT USING (true);

-- Blog posts policies (public read for published posts)
CREATE POLICY "Everyone can view published blog posts" ON blog_posts FOR SELECT USING (published = true);

-- Merch interest policies
CREATE POLICY "Anyone can join merch waitlist" ON merch_interest FOR INSERT WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_is_public ON tracks(is_public);
CREATE INDEX idx_spotlight_month ON spotlight(month);
CREATE INDEX idx_spotlight_type ON spotlight(type);
CREATE INDEX idx_spotlight_active ON spotlight(active);
CREATE INDEX idx_votes_entry_id ON votes(entry_id);
CREATE INDEX idx_votes_spotlight_id ON votes(spotlight_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_competitions_active ON competitions(active);
CREATE INDEX idx_competitions_end_date ON competitions(end_date);

-- Sample seed data for development

-- Insert sample blog posts
INSERT INTO blog_posts (slug, title, excerpt, content, author, read_time, tags, published, published_at) VALUES
(
    'ai-music-revolution',
    'The AI Music Revolution: How Technology is Reshaping Sound',
    'Explore how artificial intelligence is transforming the music industry and creating new possibilities for artists and creators worldwide.',
    '# The AI Music Revolution: How Technology is Reshaping Sound

The music industry is experiencing a profound transformation, driven by artificial intelligence technologies that are redefining how we create, produce, and experience music. This revolution isn''t just about automation—it''s about expanding the boundaries of human creativity.

## The Current Landscape

Artificial intelligence has already made significant inroads into music creation. From AI-powered composition tools to intelligent mixing and mastering software, technology is becoming an integral part of the creative process. Platforms like Orinowo are at the forefront of this movement, offering creators unprecedented access to sophisticated AI models that can generate luxury-grade tracks in seconds.

## Key Technological Advances

### Machine Learning Models
Modern AI music systems utilize advanced neural networks trained on vast datasets of musical compositions. These models can understand complex musical patterns, harmonies, and structures, enabling them to generate original compositions that rival human creativity.

### Real-time Generation
The latest AI systems can generate music in real-time, allowing for interactive composition sessions where human creators can guide and refine the AI''s output as it''s being created.

### Style Transfer and Fusion
AI can now seamlessly blend different musical styles and genres, creating unique fusion compositions that might never have been conceived by human artists alone.',
    'Sarah Mitchell',
    8,
    ARRAY['AI', 'Technology', 'Music Production', 'Innovation'],
    true,
    '2024-01-15T10:00:00Z'
),
(
    'premium-production-techniques',
    'Premium Production Techniques Every Producer Should Know',
    'Discover the professional techniques that separate amateur productions from luxury-grade tracks that dominate the charts.',
    '# Premium Production Techniques Every Producer Should Know

Creating professional, luxury-grade music requires more than just good ideas—it demands mastery of advanced production techniques that can elevate your tracks from amateur to professional quality. In this comprehensive guide, we''ll explore the essential techniques that every serious producer should have in their toolkit.',
    'David Park',
    12,
    ARRAY['Production', 'Techniques', 'Professional', 'Music'],
    true,
    '2024-01-12T14:30:00Z'
);

-- Insert sample spotlight entries
INSERT INTO spotlight (title, type, description, month, active) VALUES
('Luna Rodriguez', 'artist', 'Rising electronic music artist known for innovative soundscapes', '2024-10', true),
('Marcus Chen', 'artist', 'Producer and performer specializing in AI-assisted compositions', '2024-10', true),
('Neon Dreams', 'song', 'Chart-topping electronic track with over 1M streams', '2024-10', true),
('Digital Sunrise', 'song', 'Ambient masterpiece featuring AI-generated harmonies', '2024-10', true),
('TechBeats Pro', 'producer', 'Award-winning producer with 15+ years of experience', '2024-10', true),
('SoundCraft Studio', 'producer', 'Boutique production house specializing in luxury tracks', '2024-10', true);

-- Insert sample competition
INSERT INTO competitions (title, description, start_date, end_date, prize_pool, active) VALUES
(
    'October Beat Battle 2024',
    'Create the most innovative electronic track using AI assistance. Show us the future of music production!',
    '2024-10-01T00:00:00Z',
    '2024-10-31T23:59:59Z',
    1000000, -- $10,000 in cents
    true
);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();