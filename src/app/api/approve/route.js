import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const game = searchParams.get("game");
    const link = searchParams.get("link");
    const secret = searchParams.get("secret");

    if (secret !== process.env.APPROVAL_SECRET) {
      return new Response("Unauthorized approval link.", { status: 401 });
    }

    if (!email || !game || !link) {
      return new Response("Missing email, game, or link.", { status: 400 });
    }

    await resend.emails.send({
      from: "Game Store <onboarding@resend.dev>",
      to: email,
      subject: `Your request for ${game} has been approved`,
      html: `
        <h2>Your game request has been approved!</h2>

        <p>Hi ${name || "there"},</p>

        <p>Your request for <strong>${game}</strong> has been approved.</p>

        <p>You may access it here:</p>

        <a href="${link}" 
          style="background:#111;color:white;padding:12px 18px;text-decoration:none;border-radius:8px;">
          Open Game Link
        </a>

        <br /><br />

        <p>If the button does not work, copy and paste this link:</p>
        <p>${link}</p>
      `,
    });

    return new Response(
      `
      <html>
        <body style="font-family: Arial; padding: 40px;">
          <h1>Request Approved</h1>
          <p>The game link has been sent to ${email}.</p>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Approval error:", error);

    return new Response("Failed to approve request.", { status: 500 });
  }
}
