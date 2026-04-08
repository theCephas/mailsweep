# MailSweep

**Clean your inbox. Reclaim your peace.**

A production-grade Gmail inbox cleaning tool that allows users to connect their Gmail account via Google OAuth and bulk-delete emails from specific senders within a chosen date range.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black)
![Tech Stack](https://img.shields.io/badge/NestJS-10-red)
![Tech Stack](https://img.shields.io/badge/TypeScript-5-blue)
![Tech Stack](https://img.shields.io/badge/Prisma-5-green)

---

## 🚀 Features

- **Google OAuth Integration** - Secure authentication via Google
- **Email Search** - Find emails by sender/domain and date range
- **Bulk Actions** - Move to trash or permanently delete hundreds of emails at once
- **Real-time Updates** - Instant feedback with toast notifications
- **Pagination** - Handle large result sets efficiently
- **Safe Deletion** - Move to trash first, delete permanently when ready
- **Modern UI** - Striking dark theme with acid-green accents

---

## 🏗 Architecture

This is a **monorepo** containing:

```
mailsweep/
├── apps/
│   ├── web/               # Next.js 14 frontend (App Router)
│   └── api/               # NestJS backend
├── packages/
│   └── types/             # Shared TypeScript types
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- Axios

**Backend:**
- NestJS
- Prisma ORM
- PostgreSQL
- Passport.js (Google OAuth)
- JWT Authentication
- Gmail API

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0
- **PostgreSQL** database (local or hosted)
- **Google Cloud Project** with Gmail API enabled

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mailsweep
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Google Cloud Console

#### a. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Give your project a name (e.g., "MailSweep")

#### b. Enable Gmail API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for **"Gmail API"**
3. Click on it and click **"Enable"**

#### c. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External** (or Internal if using Google Workspace)
   - App name: **MailSweep**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add the following scopes:
     - `https://www.googleapis.com/auth/gmail.modify`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Test users: Add your Gmail address for testing
4. Go back to **Create Credentials > OAuth client ID**
5. Application type: **Web application**
6. Name: **MailSweep Web Client**
7. Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback` (development)
   - Add production URL when deploying
8. Click **"Create"**
9. Copy the **Client ID** and **Client Secret** - you'll need these for the `.env` file

### 4. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Using psql
createdb mailsweep

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE mailsweep;
\q
```

### 5. Configure Environment Variables

#### Backend (.env)

Create `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` with your values:

```env
# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# JWT Configuration (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Database (update with your PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:password@localhost:5432/mailsweep

# Application
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### Frontend (.env.local)

Create `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=MailSweep
```

### 6. Set Up Database

Run Prisma migrations:

```bash
cd apps/api
yarn prisma:generate
yarn prisma:push
cd ../..
```

---

## 🎯 Running the Application

### Development Mode

Start both frontend and backend simultaneously:

```bash
# From the root directory
yarn dev
```

This runs:
- **Backend** on `http://localhost:3001`
- **Frontend** on `http://localhost:3000`

### Run Individually

If you prefer to run them separately:

```bash
# Terminal 1 - Backend
yarn workspace @mailsweep/api dev

# Terminal 2 - Frontend
yarn workspace @mailsweep/web dev
```

---

## 🧪 Testing the Application

1. Open `http://localhost:3000` in your browser
2. Click **"Connect Gmail"** on the landing page
3. Authenticate with your Google account
4. Grant the requested permissions
5. You'll be redirected to the dashboard
6. Enter a sender email/domain (e.g., `newsletters@example.com`)
7. Select a date range
8. Click **"Search Emails"**
9. Select emails and choose **"Move to Trash"** or **"Delete Permanently"**

---

## 📁 Project Structure

### Backend (`apps/api`)

```
src/
├── auth/                 # Authentication module
│   ├── strategies/       # Passport strategies (Google, JWT)
│   ├── guards/          # Auth guards
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── gmail/               # Gmail API integration
│   ├── dto/            # Data transfer objects
│   ├── gmail.controller.ts
│   ├── gmail.service.ts
│   └── gmail.module.ts
├── users/              # User management
│   ├── users.service.ts
│   └── users.module.ts
├── prisma/             # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts
└── main.ts
```

### Frontend (`apps/web`)

```
app/
├── auth/
│   └── callback/       # OAuth callback handler
├── dashboard/          # Main app dashboard
├── globals.css
├── layout.tsx
├── page.tsx           # Landing page
└── providers.tsx
components/
└── ui/                # Reusable UI components
lib/
├── api.ts            # API client
├── auth-context.tsx  # Auth state management
└── utils.ts
```

---

## 🔐 Security Notes

- **JWT stored in httpOnly cookies** - Not accessible via JavaScript
- **SameSite=Strict** - CSRF protection
- **No token exposure** - All Gmail API calls go through the backend
- **Token refresh** - Handled automatically server-side
- **Scoped permissions** - Only `gmail.modify` scope requested

---

## 🚢 Deployment

### Backend Deployment

1. Set up PostgreSQL database on your hosting provider
2. Update environment variables:
   - `DATABASE_URL` - Production database URL
   - `FRONTEND_URL` - Production frontend URL
   - `GOOGLE_CALLBACK_URL` - Production callback URL
   - `JWT_SECRET` - Strong random secret
   - `NODE_ENV=production`
3. Add production callback URL to Google Cloud Console
4. Deploy to your preferred platform (Vercel, Railway, Render, etc.)

### Frontend Deployment

1. Update `NEXT_PUBLIC_API_URL` to your backend URL
2. Deploy to Vercel or your preferred platform

### Important: Update Google OAuth Settings

After deployment, add your production URLs to:
- **Authorized JavaScript origins**: `https://yourdomain.com`
- **Authorized redirect URIs**: `https://api.yourdomain.com/auth/google/callback`

---

## 📚 API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Clear session

### Gmail Operations (All Protected)

- `POST /gmail/search` - Search emails by sender and date range
  ```json
  {
    "sender": "example@domain.com",
    "from": "2024-01-01",
    "to": "2024-12-31"
  }
  ```
- `POST /gmail/trash` - Move emails to trash
  ```json
  {
    "ids": ["msg_id_1", "msg_id_2"]
  }
  ```
- `POST /gmail/delete` - Permanently delete emails
  ```json
  {
    "ids": ["msg_id_1", "msg_id_2"]
  }
  ```
- `GET /gmail/preview/:id` - Get email preview

---

## 🛠 Available Scripts

### Root

- `yarn dev` - Start both apps in development mode
- `yarn build` - Build all apps
- `yarn clean` - Clean all build artifacts

### Backend (`apps/api`)

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start:prod` - Start production server
- `yarn prisma:generate` - Generate Prisma client
- `yarn prisma:push` - Push schema to database
- `yarn prisma:migrate` - Run migrations
- `yarn prisma:studio` - Open Prisma Studio

### Frontend (`apps/web`)

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

---

## 🐛 Troubleshooting

### "User not found" error after OAuth

- Ensure your PostgreSQL database is running
- Run `yarn prisma:push` in the `apps/api` directory
- Check database connection string in `.env`

### CORS errors

- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check browser console for specific CORS error details

### Gmail API quota exceeded

- Google has daily quota limits for Gmail API
- Check your quota at Google Cloud Console > APIs & Services > Dashboard
- Request quota increase if needed

### Token refresh issues

- The backend automatically handles token refresh
- Check backend logs for refresh errors
- Re-authenticate if tokens are invalid

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and NestJS**
