import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, gameTitle, notes } = await request.json();

    if (!name || !email || !gameTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Email to store owner
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'kaipancho98@gmail.com',
      subject: `🎮 Game Request: ${gameTitle} — from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #f5c518; margin-bottom: 4px;">New Game Suggestion!</h1>
          <p style="color: #aaa; margin-bottom: 28px;">A customer requested a game not currently in the store.</p>

          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Name:</span> <strong>${name}</strong></p>
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Email:</span> ${email}</p>
            <p style="margin: 0 0 8px 0;"><span style="color: #f5c518;">Game Requested:</span> <strong style="color: #00d4ff; font-size: 18px;">${gameTitle}</strong></p>
            ${notes ? `<p style="margin: 0;"><span style="color: #f5c518;">Notes:</span> ${notes}</p>` : ''}
          </div>

          <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">
            GameVault PH · Game Suggestion System
          </p>
        </div>
      `,
    });

    // Confirmation email to the requester
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `✅ Game Request Noted: ${gameTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #f5c518;">Request Received! 🎮</h1>
          <p style="color: #aaa;">Hi ${name}, we've noted your game request.</p>

          <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="color: #888; margin: 0 0 4px 0; font-size: 12px;">GAME REQUESTED</p>
            <p style="color: #00d4ff; font-size: 22px; font-weight: bold; margin: 0;">${gameTitle}</p>
          </div>

          <div style="background: #1a1a2a; padding: 16px; border-radius: 8px;">
            <p style="color: #ccc; margin: 0; line-height: 2;">
              We'll review your request and add it to the store if available.<br>
              We'll notify you at <strong style="color: #fff;">${email}</strong> once it's listed. 📧
            </p>
          </div>

          <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">
            Questions? Email kaipancho98@gmail.com · GameVault PH
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
