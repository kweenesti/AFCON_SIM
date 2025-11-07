
'use server';

import { Resend } from 'resend';
import type { Match } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMatchResultEmail({
  recipientEmail,
  match,
}: {
  recipientEmail: string;
  match: Match;
}) {
  const subject = `Match Result: ${match.homeTeamName} vs ${match.awayTeamName}`;
  const body = `
    <h1>Match Result Update</h1>
    <p>The match between <strong>${match.homeTeamName}</strong> and <strong>${match.awayTeamName}</strong> has concluded.</p>
    <h2>Final Score: ${match.homeScore} - ${match.awayScore}</h2>
    <p>Winner: <strong>${match.winnerId === match.homeTeamId ? match.homeTeamName : match.awayTeamName}</strong></p>
    ${match.commentary ? `<hr><h3>AI Commentary Highlights:</h3><p>${match.commentary.substring(0, 200)}...</p>` : ''}
    <p>You can view the full match details and commentary on the tournament website.</p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Tournament AI <notifications@afrinations.lat>',
      to: recipientEmail,
      subject: subject,
      html: body,
    });

    if (error) {
      console.error(`Failed to send email to ${recipientEmail}:`, error);
      return { success: false, error };
    }

    console.log(`Email sent successfully to ${recipientEmail}, ID: ${data?.id}`);
    return { success: true, data };
  } catch (error) {
    console.error(`An unexpected error occurred while sending email to ${recipientEmail}:`, error);
    return { success: false, error };
  }
}
