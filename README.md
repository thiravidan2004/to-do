# Full-Stack Todo App

A modern, full-stack todo application built with Next.js, TypeScript, Tailwind CSS, and Supabase. This app features user authentication, real-time updates, and a clean, responsive UI.

## Features

- 🔐 **User Authentication** - Sign up, login, and logout with Supabase Auth
- ✅ **Task Management** - Create, read, update, and delete tasks
- 🔄 **Real-time Updates** - Tasks update instantly across all browser tabs
- 🛡️ **Row-Level Security** - Users can only see and modify their own tasks
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, beautiful interface built with Tailwind CSS
- 🔒 **Type Safety** - Full TypeScript support throughout the application

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd to-do
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Set up the database schema
- Configure Row-Level Security
- Get your environment variables

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── api/tasks/          # API routes for CRUD operations
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main page component
├── components/
│   ├── auth/               # Authentication components
│   │   ├── AuthTabs.tsx    # Login/signup tabs
│   │   ├── LoginForm.tsx   # Login form
│   │   ├── SignupForm.tsx  # Signup form
│   │   └── LogoutButton.tsx # Logout button
│   └── tasks/              # Task management components
│       ├── TaskForm.tsx    # Add/edit task form
│       ├── TaskItem.tsx    # Individual task item
│       └── TaskList.tsx    # Task list with real-time updates
├── lib/
│   ├── supabase.ts         # Supabase client (legacy)
│   ├── supabase-client.ts  # Browser Supabase client
│   └── supabase-server.ts  # Server-side Supabase client
└── types/
    ├── database.ts         # Database type definitions
    └── task.ts             # Task type definitions
```

## Key Features Explained

### Authentication
- Users can sign up with email/password
- Login/logout functionality
- Session management with Supabase Auth
- Protected routes and API endpoints

### Task Management
- Create new tasks with title and optional description
- Mark tasks as completed/incomplete
- Edit existing tasks inline
- Delete tasks with confirmation
- Tasks are sorted by creation date

### Real-time Updates
- Changes appear instantly across all browser tabs
- Uses Supabase Realtime for WebSocket connections
- Efficient state management with React hooks

### Security
- Row-Level Security ensures data isolation
- API routes validate user authentication
- TypeScript provides compile-time safety

## API Endpoints

- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/[id]` - Update a specific task
- `DELETE /api/tasks/[id]` - Delete a specific task

## Database Schema

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:
1. Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
2. Review the troubleshooting section
3. Open an issue on GitHub

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Supabase.
