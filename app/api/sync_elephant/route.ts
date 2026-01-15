import { NextResponse } from 'next/server';
import { updateElephantState } from '@/lib/elephantState';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Update the in-memory state on the server
    updateElephantState(body.pos, body.level, body.scenario);

    return NextResponse.json({ status: 'success', updated: body });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}