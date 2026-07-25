import { DomainCheckResult } from '../../types';

export async function checkDomains(candidateName: string): Promise<DomainCheckResult[]> {
  const extensions = ['com', 'in', 'ai', 'app', 'io'];
  const nameClean = candidateName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const results: DomainCheckResult[] = [];

  for (const ext of extensions) {
    const domain = `${nameClean}.${ext}`;
    try {
      // Use DNS over HTTPS (Cloudflare or Google DNS) to check domain record existence
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`, {
        headers: { 'Accept': 'application/dns-json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        results.push({ domain, extension: ext, status: 'error' });
        continue;
      }

      const data = await res.json();
      // Status 0 = NOERROR (usually registered/active DNS record), Status 3 = NXDOMAIN (no DNS record found -> likely available or unconfigured)
      if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
        results.push({ domain, extension: ext, status: 'registered' });
      } else if (data.Status === 3) {
        results.push({ domain, extension: ext, status: 'available' });
      } else {
        results.push({ domain, extension: ext, status: 'unknown' });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        results.push({ domain, extension: ext, status: 'unknown' });
      } else {
        results.push({ domain, extension: ext, status: 'error' });
      }
    }
  }

  return results;
}
