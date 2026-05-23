import { Resend } from 'resend';
import { games, getDriveDownloadUrl } from '../../data/games';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateApproveToken(gameId, email) {
  const secret = process.env.APPROVE_SECRET || 'gamevault-secret-2025';
  const payload = `${gameId}:${email}:${secret}`;
  return Buffer.from(payload).toString('base64url');
}

function verifyToken(token, gameId, email) {
  const expected = generateApproveToken(gameId, email);
  return token === expected;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const token  = searchParams.get('token');
  const gameId = searchParams.get('gameId');
  const email  = searchParams.get('email');
  const name   = searchParams.get('name');
  const reject = searchParams.get('reject') === 'true';

  // --- Validate inputs ---
  if (!token || !gameId || !email || !name) {
    return new Response('Missing required parameters.', { status: 400 });
  }

  if (!verifyToken(token, gameId, email)) {
    return new Response('Invalid or expired token.', { status: 403 });
  }

  const game = games.find(g => g.id === gameId);
  if (!game) {
    return new Response('Game not found.', { status: 404 });
  }

  // --- REJECT flow ---
  if (reject) {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `❌ Request Rejected: ${game.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #ff3a3a;">Request Rejected</h1>
          <p style="color: #aaa;">Hi ${name}, unfortunately your request for <strong style="color:#fff;">${game.title}</strong> was not approved.</p>
          <p style="color: #aaa;">This may be because we could not verify your GCash payment.</p>
          <p style="color: #aaa;">If you think this is a mistake, reply to this email or contact <a href="mailto:kaipancho98@gmail.com" style="color:#f5c518;">kaipancho98@gmail.com</a>.</p>
          <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">GameVault PH</p>
        </div>
      `,
    });

    return new Response(`
      <html><body style="font-family:Arial;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="color:#ff3a3a;">❌ Request Rejected</h1>
          <p style="color:#aaa;">A rejection email has been sent to ${email}.</p>
        </div>
      </body></html>
    `, { status: 200, headers: { 'Content-Type': 'text/html' } });
  }

  // --- APPROVE flow ---
  const downloadLink = getDriveDownloadUrl(gameId);

  if (!downloadLink) {
    return new Response('Download link not found for this game.', { status: 500 });
  }

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `✅ Your download link for ${game.title} is ready!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
        <h1 style="color: #39ff14;">Payment Confirmed! 🎮</h1>
        <p style="color: #aaa;">Hi ${name}, your payment has been verified. Here's your download link:</p>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #888; margin: 0 0 4px 0; font-size: 12px;">GAME</p>
          <p style="color: #f5c518; font-size: 20px; font-weight: bold; margin: 0 0 16px 0;">${game.title}</p>
          <a href="${downloadLink}" style="display: inline-block; background: #39ff14; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
            ⬇️ Download Now
          </a>
        </div>

        <div style="background: #1a1a2a; padding: 16px; border-radius: 8px;">
          <p style="color: #aaa; margin: 0; font-size: 13px; line-height: 1.8;">
            • The link will open Google Drive — click <strong>Download</strong><br>
            • Do not share this link with others<br>
            • Questions? Email <a href="mailto:kaipancho98@gmail.com" style="color:#f5c518;">kaipancho98@gmail.com</a>
          </p>
        </div>

        <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">GameVault PH · Thank you for your purchase!</p>
      </div>
    `,
  });

  return new Response(`
    <html><body style="font-family:Arial;background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;">
        <h1 style="color:#39ff14;">✅ Approved!</h1>
        <p style="color:#aaa;">Download link sent to <strong style="color:#fff;">${email}</strong>.</p>
      </div>
    </body></html>
  `, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
