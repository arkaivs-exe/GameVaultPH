import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const { customerName, customerEmail, gameName, gameLink } = body;

    if (!customerEmail || !gameName || !gameLink) {
      return Response.json(
        { error: "Missing customer email, game name, or game link." },
        { status: 400 }
      );
    }

    const approveUrl =
      `${process.env.APP_URL}/api/approve?` +
      `email=${encodeURIComponent(customerEmail)}` +
      `&name=${encodeURIComponent(customerName || "")}` +
      `&game=${encodeURIComponent(gameName)}` +
      `&link=${encodeURIComponent(gameLink)}` +
      `&secret=${encodeURIComponent(process.env.APPROVAL_SECRET)}`;

    await resend.emails.send({
      from: "Game Store <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: `New Game Request: ${gameName}`,
      html: `
        <h2>New Game Request</h2>
        <p><strong>Name:</strong> ${customerName || "Not provided"}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Game:</strong> ${gameName}</p>

        <br />

        <a href="${approveUrl}" 
          style="background:#111;color:white;padding:12px 18px;text-decoration:none;border-radius:8px;">
          Approve Request
        </a>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Request game error:", error);

    return Response.json(
      { error: "Failed to submit request." },
      { status: 500 }
    );
  }
}
