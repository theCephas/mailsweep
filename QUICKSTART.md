# MailSweep - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js >= 18.0.0 installed
- [ ] Yarn >= 1.22.0 installed
- [ ] PostgreSQL database running
- [ ] Google Cloud account

## Step-by-Step Setup

### 1. Install Dependencies
```bash
yarn install
```

### 2. Set Up Google OAuth

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API** (APIs & Services > Library)
4. Create **OAuth 2.0 Credentials** (APIs & Services > Credentials)
5. Add redirect URI: `http://localhost:3001/auth/google/callback`
6. Add scope: `https://www.googleapis.com/auth/gmail.modify`
7. Copy **Client ID** and **Client Secret**

### 3. Configure Backend Environment

Create `apps/api/.env`:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=generate_a_random_secure_string_here
JWT_EXPIRES_IN=7d

DATABASE_URL=postgresql://postgres:password@localhost:5432/mailsweep

PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Configure Frontend Environment

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=MailSweep
```

### 5. Set Up Database

```bash
cd apps/api
yarn prisma:generate
yarn prisma:push
cd ../..
```

### 6. Start the App

```bash
yarn dev
```

Visit `http://localhost:3000` 🎉

## Testing

1. Click "Connect Gmail"
2. Authenticate with Google
3. Enter sender: `example@domain.com`
4. Select date range
5. Click "Search Emails"
6. Select and delete!

## Troubleshooting

**Database connection failed?**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `apps/api/.env`

**OAuth error?**
- Verify redirect URI in Google Cloud Console
- Check client ID and secret in `.env`

**CORS error?**
- Ensure `FRONTEND_URL` matches your frontend URL

For detailed documentation, see [README.md](./README.md)
