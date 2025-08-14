'use client';
import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, subdomain }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Failed to sign up');
      return;
    }
    const { redirectUrl } = await res.json();
    // auto sign-in with credentials right after account creation
    await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: redirectUrl ?? '/dashboard',
    });
  };

  return (
    <div className="max-w-sm mx-auto pt-16">
      <h1 className="text-2xl font-semibold mb-6">Create your store</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Store name"
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subdomain (e.g. mystore)"
          className="w-full border rounded px-3 py-2"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          required
        />
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
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create store'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <a className="underline" href="/signin">
          Sign in
        </a>
      </p>
    </div>
  );
}
