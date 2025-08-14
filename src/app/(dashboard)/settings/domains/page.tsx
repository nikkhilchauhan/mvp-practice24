import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import DomainForm from './server-form';

export default async function DomainSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <div className="p-8">Not signed in</div>;
  }
  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.findFirst({
    where: { ownerId: userId },
    include: { domains: true },
  });
  if (!store) return <div className="p-8">No store found</div>;

  const primary = process.env.PRIMARY_DOMAIN ?? 'localhost:3000';

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Domains</h1>
      <div>
        <p className="mb-2 text-sm text-gray-600">Your store subdomain</p>
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-gray-100 rounded">
            {store.subdomain}.{primary}
          </code>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-gray-600">Custom domains</p>
        <ul className="list-disc pl-5">
          {store.domains.map((d) => (
            <li key={d.id}>{d.host}</li>
          ))}
        </ul>
      </div>
      <DomainForm storeId={store.id} />
    </div>
  );
}
