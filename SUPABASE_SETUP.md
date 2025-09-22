# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization and fill in project details
4. Wait for the project to be created

## 2. Get Your Project Credentials

1. Go to your project dashboard
2. Click on "Settings" in the sidebar
3. Click on "API" 
4. Copy the following values:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon/public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY) - only if needed

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Create the Database Schema

Go to the SQL Editor in your Supabase dashboard and run the following SQL:

```sql
-- Create the tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own tasks
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index for better performance
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
```

## 5. Configure Authentication

1. Go to "Authentication" > "Settings" in your Supabase dashboard
2. Configure your site URL:
   - For development: `http://localhost:3000`
   - For production: your deployed URL
3. Configure redirect URLs if needed
4. Enable email confirmation if desired (optional)

## 6. Test the Setup

1. Run your Next.js app: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try creating an account and logging in
4. Create some tasks to test the functionality

## Optional: Enable Real-time Updates

If you want real-time updates (tasks appearing/updating live), you can enable Supabase Realtime:

1. Go to "Database" > "Replication" in your Supabase dashboard
2. Enable replication for the `tasks` table
3. The app is already configured to handle real-time updates

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that RLS policies are enabled and configured correctly
- Verify that your Supabase project URL and keys are correct
- Check the browser console and server logs for any errors
