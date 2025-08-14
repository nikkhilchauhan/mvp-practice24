import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export default async function StoreCatchAllPage() {
  const hdrs = await headers();
  const host = (hdrs.get('host') ?? '').toLowerCase();
  const primary = (
    process.env.PRIMARY_DOMAIN ?? 'localhost:3000'
  ).toLowerCase();
  let subdomain: string | null = null;

  if (host.endsWith(`.${primary}`)) {
    subdomain = host.slice(0, -1 * `.${primary}`.length);
  } else {
    // custom domain
    const domain = await prisma.domain.findUnique({ where: { host } });
    if (domain) {
      const store = await prisma.store.findUnique({
        where: { id: domain.storeId },
      });
      subdomain = store?.subdomain ?? null;
    }
  }

  if (!subdomain) {
    return <div className="p-8">Store not found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-2">Store: {subdomain}</h1>
      <p>This is the public storefront placeholder for {subdomain}.</p>
    </div>
  );
}
