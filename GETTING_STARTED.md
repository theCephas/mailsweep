# 🚀 Getting Started with MailSweep

Welcome to MailSweep! This guide will help you get the application running locally.

## ✅ Pre-Flight Checklist

Before starting, make sure you have:

- [ ] **Node.js 18+** - Run `node --version` to check
- [ ] **Yarn** - Run `yarn --version` to check
- [ ] **PostgreSQL** - Database server running locally or remotely
- [ ] **Google Account** - For creating OAuth credentials
- [ ] **Code Editor** - VS Code recommended

## 📝 Setup Checklist

### 1. Install Dependencies
```bash
cd mailsweep
yarn install
```
- [ ] Dependencies installed without errors

### 2. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
createdb mailsweep
```

**Option B: Use existing database**
- Just need a PostgreSQL connection string

- [ ] Database created/available

### 3. Configure Google Cloud Project

#### Create Project
1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
2. [ ] Click "Create Project"
3. [ ] Name it "MailSweep" (or your preference)
4. [ ] Note your Project ID

#### Enable Gmail API
1. [ ] Navigate to "APIs & Services" > "Library"
2. [ ] Search for "Gmail API"
3. [ ] Click "Enable"

#### Configure OAuth Consent Screen
1. [ ] Go to "APIs & Services" > "OAuth consent screen"
2. [ ] Choose "External" (or "Internal" if using Workspace)
3. [ ] Fill in:
   - [ ] App name: **MailSweep**
   - [ ] User support email: **your@email.com**
   - [ ] Developer contact: **your@email.com**
4. [ ] Click "Save and Continue"
5. [ ] Add Scopes:
   - [ ] `https://www.googleapis.com/auth/gmail.modify`
   - [ ] `https://www.googleapis.com/auth/userinfo.email`
   - [ ] `https://www.googleapis.com/auth/userinfo.profile`
6. [ ] Add Test Users (your Gmail address)
7. [ ] Complete the setup

#### Create OAuth Credentials
1. [ ] Go to "APIs & Services" > "Credentials"
2. [ ] Click "Create Credentials" > "OAuth client ID"
3. [ ] Select "Web application"
4. [ ] Name: **MailSweep Web Client**
5. [ ] Authorized redirect URIs:
   - [ ] Add: `http://localhost:3001/auth/google/callback`
6. [ ] Click "Create"
7. [ ] **COPY** your Client ID
8. [ ] **COPY** your Client Secret

### 4. Configure Backend Environment

Create `apps/api/.env`:

```bash
# Copy the example file
cp apps/api/.env.example apps/api/.env

# Edit with your values
nano apps/api/.env  # or use your preferred editor
```

Fill in:
```env
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

JWT_SECRET=GENERATE_A_SECURE_RANDOM_STRING
JWT_EXPIRES_IN=7d

DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/mailsweep

PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Generate JWT Secret** (run this):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] `GOOGLE_CLIENT_ID` filled in
- [ ] `GOOGLE_CLIENT_SECRET` filled in
- [ ] `JWT_SECRET` generated and filled in
- [ ] `DATABASE_URL` updated with your credentials

### 5. Configure Frontend Environment

Create `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

The defaults should work:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=MailSweep
```

- [ ] Frontend `.env.local` created

### 6. Initialize Database

```bash
cd apps/api
yarn prisma:generate
yarn prisma:push
cd ../..
```

Expected output:
```
✔ Generated Prisma Client
✔ Database schema pushed to database
```

- [ ] Prisma client generated
- [ ] Database schema pushed successfully

### 7. Start the Application

From the root directory:
```bash
yarn dev
```

You should see:
```
🚀 MailSweep API running on http://localhost:3001
▲ Next.js 14 ready on http://localhost:3000
```

- [ ] Backend started on port 3001
- [ ] Frontend started on port 3000
- [ ] No error messages

## 🧪 Test the Application

### 1. Open the Landing Page
- [ ] Visit `http://localhost:3000`
- [ ] See the MailSweep landing page
- [ ] Dark theme with green accents loads correctly

### 2. Test OAuth Flow
- [ ] Click "Connect Gmail" button
- [ ] Redirected to Google sign-in
- [ ] See "MailSweep wants to access your Google Account"
- [ ] Grant permissions
- [ ] Redirected back to `http://localhost:3000/dashboard`

### 3. Test Email Search
On the dashboard:
- [ ] Enter a sender email/domain (e.g., `newsletters@company.com`)
- [ ] Select "From" date
- [ ] Select "To" date
- [ ] Click "Search Emails"
- [ ] See results (or "No emails found" if no matches)

### 4. Test Email Actions
If you found emails:
- [ ] Check some email checkboxes
- [ ] See selected count update
- [ ] Click "Move to Trash"
- [ ] See success toast notification
- [ ] Emails removed from list

### 5. Test Permanent Delete
- [ ] Select emails
- [ ] Click "Delete Permanently"
- [ ] See confirmation dialog
- [ ] Confirm deletion
- [ ] See success toast

## 🎯 Success Criteria

You've successfully set up MailSweep if:

✅ Both apps start without errors
✅ Landing page loads with proper styling
✅ OAuth flow completes successfully
✅ Dashboard shows your email address
✅ Email search returns results
✅ Trash/delete operations work
✅ Toast notifications appear

## 🐛 Troubleshooting

### Backend won't start
```
Error: getaddrinfo ENOTFOUND
```
**Solution**: Check your `DATABASE_URL` in `apps/api/.env`

### OAuth error: "redirect_uri_mismatch"
**Solution**:
1. Check Google Cloud Console
2. Verify redirect URI is exactly: `http://localhost:3001/auth/google/callback`
3. No trailing slash!

### "User not found" after OAuth
**Solution**:
```bash
cd apps/api
yarn prisma:push
```

### CORS error in browser console
**Solution**:
- Ensure `FRONTEND_URL` in backend `.env` is `http://localhost:3000`
- Restart the backend

### Gmail API quota exceeded
**Solution**:
- Check quota in Google Cloud Console
- Each search counts toward daily quota
- Default quota is usually sufficient for development

## 📚 Next Steps

Now that you're running:

1. **Read [README.md](./README.md)** for full documentation
2. **Check [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** for architecture details
3. **Start building** or customizing for your needs!

## 🆘 Still Having Issues?

1. Check the full error message
2. Review the [README.md](./README.md) troubleshooting section
3. Ensure all environment variables are set correctly
4. Verify PostgreSQL is running
5. Check Google Cloud Console settings

## 🎉 You're All Set!

Enjoy using MailSweep to clean your inbox!

---

**Quick Commands Reference:**

```bash
# Start everything
yarn dev

# Stop: Ctrl+C in terminal

# Reset database
cd apps/api && yarn prisma:push && cd ../..

# View database
cd apps/api && yarn prisma:studio
```
