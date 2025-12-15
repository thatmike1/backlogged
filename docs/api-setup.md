# IGDB API Setup Guide

IGDB (Internet Game Database) is owned by Twitch/Amazon and provides comprehensive game metadata. Access is free but requires Twitch developer credentials.

## Step 1: Create a Twitch Developer Account

1. Go to [dev.twitch.tv](https://dev.twitch.tv)
2. Log in with your Twitch account (or create one)
3. Enable 2FA if you haven't already (required for dev access)

## Step 2: Register Your Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in the details:
   - **Name**: `backlogged` (or whatever you want)
   - **OAuth Redirect URLs**: `http://localhost` (we won't actually use OAuth flow)
   - **Category**: `Application Integration`
4. Click "Create"

## Step 3: Get Your Credentials

1. In the Developer Console, find your app and click "Manage"
2. You'll see your **Client ID**
3. Click "New Secret" to generate a **Client Secret**
4. **Save both values** - the secret is only shown once!

## Step 4: Configure Backlogged

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

## How Authentication Works

IGDB uses Twitch's OAuth Client Credentials flow:

1. We exchange your Client ID + Secret for an access token
2. The token is used for all IGDB API requests
3. Tokens expire after ~60 days, but we auto-refresh them

You don't need to do anything manually - the app handles token management.

## API Limits

- **Free tier**: 4 requests per second
- **No monthly limit** on number of requests
- Rate limiting is handled automatically by the app

## Troubleshooting

### "Invalid client" error
- Double-check your Client ID and Secret
- Make sure there are no extra spaces in your `.env` file

### "Invalid token" error
- The token may have expired - the app should auto-refresh
- If issues persist, delete `data/token.json` and restart

### 2FA required
- Twitch requires 2FA for developer accounts
- Enable it at [twitch.tv/settings/security](https://www.twitch.tv/settings/security)

## IGDB API Reference

For advanced usage, see the official docs:
- [IGDB API Docs](https://api-docs.igdb.com/)
- [Endpoints Reference](https://api-docs.igdb.com/#endpoints)
- [Query Language (Apicalypse)](https://api-docs.igdb.com/#apicalypse)
