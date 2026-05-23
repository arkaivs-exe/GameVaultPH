import { Resend } from 'resend';
import { games, getDriveDownloadUrl } from '../../data/games';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple token: base64 of gameId + email + secret
function generateApproveToken(gameId, email) {
  const secret = process.env.APPROVE_SECRET || 'gamevault-secret-2025';
  const payload = `${gameId}:${email}:${secret}`;
  return Buffer.from(payload).toString('base64url');
}

export async function POST(request) {
  try {
    const { name, email, gameId } = await request.json();

    if (!name || !email || !gameId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const game = games.find(g => g.id === gameId);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const token = generateApproveToken(gameId, email);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const approveUrl = `${baseUrl}/api/approve?token=${token}&gameId=${gameId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`;
    const rejectUrl = `${baseUrl}/api/approve?token=${token}&gameId=${gameId}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&reject=true`;

    // Email to store owner — with Approve/Reject buttons
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kaipancho98@gmail.com',
      subject: `🎮 New Request: ${game.title} — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #f5c518; margin-bottom: 4px;">New Game Request!</h1>
          <p style="color: #aaa; margin-bottom: 28px;">Check GCash first, then approve or reject below.</p>

          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Name:</span> <strong>${name}</strong></p>
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Email:</span> ${email}</p>
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Game:</span> <strong>${game.title}</strong></p>
            <p style="margin: 0;"><span style="color: #f5c518;">Amount:</span> ₱${game.price}</p>
          </div>

          <div style="background: #001a3a; padding: 16px; border-radius: 8px; margin-bottom: 28px; text-align: center;">
            <p style="color: #6699cc; margin: 0 0 4px 0; font-size: 12px; letter-spacing: 2px;">CHECK GCASH FIRST</p>
            <p style="color: #fff; font-size: 22px; font-weight: bold; letter-spacing: 3px; margin: 0;">09296729143</p>
          </div>

          <div style="display: flex; gap: 12px; text-align: center;">
            <a href="${approveUrl}" style="flex: 1; display: block; background: #39ff14; color: #000; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 2px;">
              ✅ APPROVE & SEND LINK
            </a>
          </div>
          <div style="margin-top: 12px; text-align: center;">
            <a href="${rejectUrl}" style="display: inline-block; background: #1a1a1a; color: #ff3a3a; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; border: 1px solid #ff3a3a;">
              ❌ Reject Request
            </a>
          </div>

          <p style="color: #444; font-size: 11px; margin-top: 24px; text-align: center;">
            GameVault PH · Do not share this email
          </p>
        </div>
      `,
    });

    // Confirmation email to buyer (no link yet — pending approval)
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `⏳ Request Received: ${game.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #f5c518;">Request Received! 🎮</h1>
          <p style="color: #aaa;">Hi ${name}, we've received your request.</p>

          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #888; margin: 0 0 4px 0; font-size: 12px;">GAME REQUESTED</p>
            <p style="color: #f5c518; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">${game.title}</p>
            <p style="color: #ccc; margin: 0;">Amount: <strong style="color: #fff;">₱${game.price}</strong></p>
          </div>

          <div style="background: #001a3a; padding: 20px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
            <p style="color: #6699cc; margin: 0 0 8px 0; font-size: 12px; letter-spacing: 2px;">SEND PAYMENT VIA GCASH</p>
            <p style="color: #fff; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 0 0 8px 0;">09296729143</p>
            <p style="color: #6699cc; font-size: 12px; margin: 0;">Include your name in the GCash note</p>
          </div>

          <div style="background: #1a1a2a; padding: 16px; border-radius: 8px;">
            <p style="color: #ccc; margin: 0; line-height: 2;">
              1. Send ₱${game.price} to the GCash number above<br>
              2. Once we verify your payment, we'll email you the download link<br>
              3. Check this email address for the link 📧
            </p>
          </div>

          <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">
            Questions? Email kaipancho98@gmail.com
          </p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to send request' }, { status: 500 });
  }
}
