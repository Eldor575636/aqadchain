const { google } = require('googleapis');

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

/**
 * Parse a date (YYYY-MM-DD) + a 12h time string ("10:00 AM") into a Date.
 */
function combineDateAndTime(dateInput, timeStr) {
  const date = new Date(dateInput);
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return date;
  let [, hours, minutes, meridiem] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  if (meridiem.toUpperCase() === 'PM' && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;
  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Create a Google Calendar event with a Google Meet link for a demo request.
 * Returns { meetLink, eventId } or null if not configured / on failure.
 */
async function createMeetEvent(request) {
  if (!isConfigured()) return null;

  try {
    const auth = getOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

    const start = combineDateAndTime(request.preferred_date, request.preferred_time);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      conferenceDataVersion: 1,
      sendUpdates: 'all',
      requestBody: {
        summary: `AqadChain Demo — ${request.name}`,
        description: request.message || 'Live walkthrough of AqadChain.',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: [{ email: request.email, displayName: request.name }],
        conferenceData: {
          createRequest: {
            requestId: request.id,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || null;
    return { meetLink, eventId: response.data.id };
  } catch (err) {
    console.error('[GoogleCalendar] Failed to create Meet event:', err.message);
    return null;
  }
}

module.exports = { createMeetEvent, isConfigured };
