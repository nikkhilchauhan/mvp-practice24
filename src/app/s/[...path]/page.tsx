import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignedInPanel, SignInPanel } from '../_components/AuthPanel';

export default async function StoreCatchAllPage({ params }: { params: { path?: string[] } }) {
  const hdrs = await headers();
  const host = (hdrs.get('host') ?? '').toLowerCase();
  const primary = (
    process.env.PRIMARY_DOMAIN ?? 'localhost:3000'
  ).toLowerCase();
  let subdomain: string | null = null;

  if (host.endsWith(`.${primary}`)) {
    subdomain = host.slice(0, -1 * `.${primary}`.length);
    // Ensure the subdomain corresponds to an existing store
    const store = await prisma.store.findFirst({ where: { subdomain } });
    if (!store) {
      notFound();
    }
  } else {
    // custom domain
    const domain = await prisma.domain.findUnique({ where: { host } });
    if (!domain) {
      notFound();
    }
    const store = await prisma.store.findUnique({
      where: { id: domain.storeId },
    });
    if (!store) {
      notFound();
    }
    subdomain = store.subdomain;
  }

  const session = await getServerSession(authOptions);
  const segments = params.path ?? [];
  const isRoot = segments.length === 0;

  if (isRoot) {
    return (
      <div className="p-10 space-y-6">
        <h1 className="text-2xl font-semibold">{subdomain}</h1>
        {session?.user ? <SignedInPanel /> : <SignInPanel />}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Store: {subdomain}</h1>
      <p>This is the public storefront placeholder for {subdomain}.</p>
    </div>
  );
}
