import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/ai/flows/send-welcome-email-flow';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await sendWelcomeEmail({ to: email });

    return NextResponse.json({ message: 'Subscription successful' }, { status: 200 });
  } catch (error) {
    console.error('Newsletter Error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
