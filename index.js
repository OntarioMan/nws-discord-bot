import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import 'dotenv/config';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const channelId = process.env.DISCORD_CHANNEL_ID;
const area = process.env.NWS_AREA;
const point = process.env.NWS_POINT;
const pollMs = Number(process.env.CHECK_INTERVAL_MS || 60000);

const seenAlerts = new Set();

function buildAlertsUrl() {
  const url = new URL('https://api.weather.gov/alerts/active');
  if (point) {
    url.searchParams.set('point', point);
  } else if (area) {
    url.searchParams.set('area', area);
  } else {
    url.searchParams.set('area', 'US');
  }
  return url;
}

async function fetchAlerts() {
  const url = buildAlertsUrl();

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'nws-discord-bot/1.0',
      Accept: 'application/geo+json'
    }
  });

  if (!response.ok) {
    throw new Error(`NWS API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.features || [];
}

function severityColor(severity) {
  switch (severity?.toUpperCase()) {
    case 'EXTREME': return 0xff0000;
    case 'SEVERE': return 0xff6600;
    case 'MODERATE': return 0xffaa00;
    case 'MILD': return 0xcc5a00;
    default: return 0x808080;
  }
}

function formatDate(dateValue) {
  const d = new Date(dateValue);
  return Number.isNaN(d.getTime()) ? 'Unknown' : `<t:${Math.floor(d.getTime() / 1000)}:F>`;
}

function buildAlertEmbed(feature) {
  const props = feature.properties || {};
  const event = props.event || 'Weather Alert';
  const severity = props.severity || 'Unknown';
  const certainty = props.certainty || 'Unknown';
  const urgency = props.urgency || 'Unknown';
  const areaDesc = props.areaDesc || 'Unknown';
  const headline = props.headline || event;
  const instruction = props.instruction || 'Follow local emergency guidance.';
  const effective = formatDate(props.effective);
  const expires = props.expires ? formatDate(props.expires) : 'Not specified';
  const url = props.web || 'https://www.weather.gov/';

  return new EmbedBuilder()
    .setColor(severityColor(severity))
    .setTitle(`${event} • ${severity}`)
    .setURL(url)
    .setDescription(headline)
    .addFields(
      { name: 'Area', value: areaDesc, inline: true },
      { name: 'Urgency', value: urgency, inline: true },
      { name: 'Certainty', value: certainty, inline: true },
      { name: 'Effective', value: effective, inline: true },
      { name: 'Expires', value: expires, inline: true },
      { name: 'Instructions', value: instruction.slice(0, 1024) || 'No additional instructions.', inline: false }
    )
    .setFooter({ text: `Alert ID: ${props.id || 'unknown'}` });
}

async function postNewAlerts() {
  const alerts = await fetchAlerts();

  for (const feature of alerts) {
    const alertId = feature.id;
    if (!alertId || seenAlerts.has(alertId)) continue;

    seenAlerts.add(alertId);

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.error(`Channel ${channelId} not found or not text-based.`);
      continue;
    }

    const embed = buildAlertEmbed(feature);
    await channel.send({ embeds: [embed] });
    console.log(`Posted alert: ${feature.properties?.event || alertId}`);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(postNewAlerts, pollMs).unref();
  postNewAlerts().catch(console.error);
});

client.login(process.env.DISCORD_TOKEN);
