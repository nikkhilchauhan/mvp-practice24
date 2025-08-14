import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bodySchema = z.object({
  storeId: z.string().min(1),
  host: z.string().min(3).max(255),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { storeId, host } = parsed.data;
  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findFirst({
    where: { id: storeId, ownerId: userId },
  });
  if (!store) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const clean = host.toLowerCase().trim();
  if (
    !/^[a-z0-9.-]+$/.test(clean) ||
    clean.startsWith('-') ||
    clean.endsWith('-')
  ) {
    return NextResponse.json({ error: 'Invalid host' }, { status: 400 });
  }
  const exists = await prisma.domain.findUnique({ where: { host: clean } });
  if (exists)
    return NextResponse.json(
      { error: 'Domain already exists' },
      { status: 409 }
    );

  await prisma.domain.create({ data: { host: clean, storeId } });
  return NextResponse.json({ ok: true });
}
