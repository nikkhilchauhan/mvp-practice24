import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function StoreCatchAllPage() {
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Store: {subdomain}</h1>
      <p>This is the public storefront placeholder for {subdomain}.</p>
    </div>
  );
}
