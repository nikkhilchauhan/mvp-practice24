import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="p-8">
        <p>You are not signed in.</p>
        <Link className="underline" href="/signin">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Welcome, {session.user.name ?? session.user.email}</p>
      <Link className="underline" href="/settings/domains">
        Domain settings
      </Link>
    </div>
  );
}
