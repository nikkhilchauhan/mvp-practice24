type CloudflareDnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
};

const CF_API = "https://api.cloudflare.com/client/v4";

function getEnv() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const originIp = process.env.ORIGIN_IP;
  const primaryDomain = process.env.PRIMARY_DOMAIN ?? "localhost:3000";
  return { token, zoneId, originIp, primaryDomain };
}

export async function ensureSubdomainDnsRecord(subdomain: string): Promise<void> {
  const { token, zoneId, originIp, primaryDomain } = getEnv();

  // Skip in local dev or if env is not configured
  const isLocal = primaryDomain.includes("localhost") || primaryDomain.includes("127.0.0.1");
  if (!token || !zoneId || !originIp || isLocal) return;

  const name = `${subdomain}.${primaryDomain}`;

  // Look up existing record
  const listRes = await fetch(
    `${CF_API}/zones/${zoneId}/dns_records?type=A&name=${encodeURIComponent(name)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  );
  const listData = (await listRes.json()) as { success: boolean; result: CloudflareDnsRecord[] };
  const existing = listData?.result?.[0];

  if (existing) {
    if (existing.content === originIp && existing.proxied === true) return;
    await fetch(`${CF_API}/zones/${zoneId}/dns_records/${existing.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "A", name, content: originIp, proxied: true, ttl: 120 }),
    });
    return;
  }

  // Create new record
  await fetch(`${CF_API}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "A", name, content: originIp, proxied: true, ttl: 120 }),
  });
}


