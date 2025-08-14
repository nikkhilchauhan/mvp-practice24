import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      // Only customize on credentials sign-in
      if (!user?.id || account?.provider !== 'credentials') {
        return true;
      }
      try {
        const store = await prisma.store.findFirst({
          where: { ownerId: String(user.id) },
          include: { domains: true },
        });
        if (!store) return true;
        const primary = process.env.PRIMARY_DOMAIN ?? 'localhost:3000';
        const isLocal =
          primary.includes('localhost') || primary.includes('127.0.0.1');
        const protocol = isLocal ? 'http' : 'https';
        const host =
          store.domains.length > 0
            ? store.domains[0].host
            : `${store.subdomain}.${primary}`;
        return `${protocol}://${host}/dashboard`;
      } catch {
        return true;
      }
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.userId && session.user) {
        (session.user as { id?: string }).id = String(token.userId);
      }
      return session;
    },
  },
};
