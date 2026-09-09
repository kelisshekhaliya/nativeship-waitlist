import { NextResponse } from "next/server";

const DEFAULT_WEBHOOK_URL = "https://n8n.spidlabs.com/webhook/0mcp-waiting-list";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      website?: unknown;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const honeypot = typeof body.website === "string" ? body.website.trim() : "";

    if (honeypot) {
      return NextResponse.json({ message: "Thanks, you're on the waiting list." });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const webhookUrl = process.env.WAITLIST_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: "nativeship-waitlist",
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { message: "The waiting list is not accepting signups right now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: "You're on the waiting list. We will email you soon." });
  } catch {
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
