import { Resend } from 'resend';
import { games, getDriveDownloadUrl } from '../../data/games';

const resend = new Resend(process.env.RESEND_API_KEY);

function verifyToken(token, gameId, email) {
  const secret = process.env.APPROVE_SECRET || 'gamevault-secret-2025';
  const expected = Buffer.from(`${gameId}:${email}:${secret}`).toString('base64url');
  return token === expected;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const gameId = parseInt(searchParams.get('gameId'));
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const reject = searchParams.get('reject') === 'true';

  if (!token || !gameId || !email) {
    return new Response(html('❌ Invalid Link', 'This link is invalid or expired.', '#ff3a3a'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  if (!verifyToken(token, gameId, email)) {
    return new Response(html('❌ Invalid Token', 'This link is not valid.', '#ff3a3a'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const game = games.find(g => g.id === gameId);
  if (!game) {
    return new Response(html('❌ Game Not Found', 'Could not find this game.', '#ff3a3a'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // REJECTED
  if (reject) {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `❌ Request Rejected: ${game.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #ff3a3a;">Request Not Approved</h1>
          <p style="color: #aaa;">Hi ${name}, unfortunately we could not verify your payment for <strong>${game.title}</strong>.</p>
          <p style="color: #aaa;">If you believe this is a mistake, please contact <a href="mailto:kaipancho98@gmail.com" style="color: #f5c518;">kaipancho98@gmail.com</a>.</p>
        </div>
      `,
    });

    return new Response(html('Request Rejected', `Rejection email sent to ${email}.`, '#ff3a3a'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // APPROVED — send download link
  const downloadUrl = getDriveDownloadUrl(game.driveId);

  if (!downloadUrl) {
    return new Response(html('⚠️ No Link Set', `The download link for "${game.title}" has not been added yet. Please add the driveId in games.js.`, '#f5c518'), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `✅ Your Download Link: ${game.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="color: #39ff14;">Payment Confirmed! 🎮</h1>
        <p style="color: #aaa;">Hi ${name}, your payment has been verified. Here is your download link:</p>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 24px 0; text-align: center;">
          <p style="color: #888; margin: 0 0 8px 0; font-size: 12px;">YOUR GAME</p>
          <p style="color: #f5c518; font-size: 22px; font-weight: bold; margin: 0 0 20px 0;">${game.title}</p>
          <a href="${downloadUrl}" style="display: inline-block; background: #39ff14; color: #000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 2px;">
            ⬇️ DOWNLOAD NOW
          </a>
        </div>

        <div style="background: #1a2a1a; padding: 16px; border-radius: 8px;">
          <p style="color: #4ade80; margin: 0 0 8px 0; font-size: 13px; font-weight: bold;">📌 Notes:</p>
          <ul style="color: #aaa; margin: 0; padding-left: 20px; line-height: 2; font-size: 13px;">
            <li>The download will start directly from Google Drive</li>
            <li>Do not share this link with others</li>
            <li>Link may expire — download as soon as possible</li>
          </ul>
        </div>

        <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">
          Thank you for your purchase! · GameVault PH
        </p>
      </div>
    `,
  });

  return new Response(html('✅ Approved!', `Download link sent to ${email} for "${game.title}".`, '#39ff14'), {
    headers: { 'Content-Type': 'text/html' },
  });
}

function html(title, message, color) {
  return `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body style="font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
  <div style="text-align: center; padding: 48px; background: #1a1a1a; border-radius: 12px; border: 1px solid #333; max-width: 480px;">
    <h1 style="color: ${color}; font-size: 32px;">${title}</h1>
    <p style="color: #aaa; font-size: 16px; line-height: 1.6;">${message}</p>
    <p style="color: #555; font-size: 13px; margin-top: 24px;">You can close this tab.</p>
  </div>
</body>
</html>`;
}
