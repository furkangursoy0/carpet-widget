import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { email, message } = await req.json();
  if (!email || !message) return NextResponse.json({ error: 'missing' }, { status: 400 });

  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: true, skipped: 'no_resend_key' });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'hello@sceneva.com',
    to: 'hello@sceneva.com',
    replyTo: email,
    subject: `Contact form: ${email}`,
    text: message,
  });
  return NextResponse.json({ ok: true });
}
