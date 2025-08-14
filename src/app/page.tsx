export default function Home() {
  return (
    <div className="p-10 space-y-4">
      <h1 className="text-3xl font-semibold">Build your store</h1>
      <p className="text-gray-600">
        Create a store with email, password, and subdomain. Add your own domain
        later.
      </p>
      <div className="space-x-3">
        <a
          href="/signup"
          className="inline-block bg-black text-white px-4 py-2 rounded"
        >
          Get started
        </a>
        <a href="/signin" className="inline-block border px-4 py-2 rounded">
          Sign in
        </a>
      </div>
    </div>
  );
}
