import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const reserved = (process.env.RESERVED_SUBDOMAINS ?? 'www,admin,app,api')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const bodySchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(64),
  password: z.string().min(6).max(100),
  subdomain: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i, 'Invalid subdomain'),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const { email, name, password, subdomain } = parsed.data;
  const sub = subdomain.toLowerCase();
  if (reserved.includes(sub)) {
    return NextResponse.json(
      { error: 'Subdomain is reserved' },
      { status: 400 }
    );
  }
  const existing = await prisma.store.findFirst({ where: { subdomain: sub } });
  if (existing) {
    return NextResponse.json(
      { error: 'Subdomain already taken' },
      { status: 409 }
    );
  }
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: 'Email already in use' },
      { status: 409 }
    );
  }
  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      stores: {
        create: {
          name,
          subdomain: sub,
        },
      },
    },
    include: { stores: true },
  });

  const primary = process.env.PRIMARY_DOMAIN ?? 'localhost:3000';
  const isLocal =
    primary.includes('localhost') || primary.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : 'https';
  const redirectUrl = `${protocol}://${sub}.${primary}/dashboard`;

  return NextResponse.json({ redirectUrl, userId: user.id });
}
