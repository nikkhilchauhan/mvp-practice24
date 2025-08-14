'use client';
import { FormEvent, useState } from 'react';

export default function DomainForm({ storeId }: { storeId: string }) {
  const [host, setHost] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId, host }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? 'Failed to add domain');
    } else {
      window.location.reload();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 max-w-md">
      <input
        type="text"
        placeholder="yourdomain.com"
        className="w-full border rounded px-3 py-2"
        value={host}
        onChange={(e) => setHost(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add domain'}
      </button>
    </form>
  );
}
