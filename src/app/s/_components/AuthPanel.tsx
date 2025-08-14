'use client';
import { FormEvent, useState } from 'react';
import { signIn, signOut } from 'next-auth/react';

export function SignInPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/dashboard',
    });
    setLoading(false);
    if (res?.error) {
      setError('Invalid credentials');
    } else if (res?.ok) {
      window.location.href = res.url ?? '/dashboard';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sign in to your store</h2>
      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account? <a className="underline" href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export function SignedInPanel() {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">You are signed in</h2>
      <div className="space-x-3">
        <a href="/dashboard" className="underline">Go to dashboard</a>
        <button
          className="border px-3 py-1 rounded"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Log out
        </button>
      </div>
    </div>
  );
}


