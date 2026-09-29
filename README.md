# NWS Discord Alert Bot

A Discord bot that fetches and posts National Weather Service (NWS) alerts to a Discord channel.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
DISCORD_TOKEN=YOUR_DISCORD_BOT_TOKEN
DISCORD_CHANNEL_ID=YOUR_CHANNEL_ID
NWS_AREA=US
CHECK_INTERVAL_MS=60000
```

### 3. Run the Bot

```bash
npm start
```

## Configuration

- **DISCORD_TOKEN**: Your Discord bot token from the Developer Portal
- **DISCORD_CHANNEL_ID**: The channel ID where alerts will be posted
- **NWS_AREA**: US state code (e.g., `NC`, `FL`, `TX`) or `US` for national alerts
- **NWS_POINT**: Alternative to NWS_AREA - latitude,longitude (e.g., `35.78,-78.64`)
- **CHECK_INTERVAL_MS**: How often to check for new alerts (default: 60000ms = 1 minute)

## Discord Setup

1. Create a bot application in the [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy your bot token and add it to `.env`
3. Add the bot to your server with these permissions:
   - View Channels
   - Send Messages
   - Embed Links
4. Copy your channel ID and add it to `.env`

## Alert Severity Colors

- **EXTREME** - Red (0xFF0000)
- **SEVERE** - Orange (0xFF6600)
- **MODERATE** - Yellow (0xFFAA00)
- **MILD** - Dark Orange (0xCC5A00)

## How It Works

1. The bot polls the NWS API at the specified interval
2. New alerts are formatted as Discord embeds with all relevant information
3. Only previously unseen alerts are posted (no duplicates)
4. Each alert includes severity, area, urgency, certainty, and instructions

## National Alerts

To get alerts for the entire United States, set:

```env
NWS_AREA=US
```
