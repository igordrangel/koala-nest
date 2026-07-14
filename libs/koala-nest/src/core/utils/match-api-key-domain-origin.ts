import dns from 'node:dns/promises';
import net from 'node:net';

function stripIpv4Mapped(ip: string) {
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }

  return ip;
}

function hostnameMatches(registered: string, hostnames: string[]) {
  const needle = registered.toLowerCase().replace(/\.$/, '');

  return hostnames.some((hostname) => {
    const candidate = hostname.toLowerCase().replace(/\.$/, '');
    return candidate === needle || candidate.endsWith(`.${needle}`);
  });
}

/**
 * Valida origem tipo `domain`: item cadastrado pode ser IP ou hostname.
 * - IP → match exato com o IP do cliente
 * - domínio → reverse DNS do cliente ou A/AAAA do domínio inclui o IP
 */
export async function matchApiKeyDomainOrigin(
  clientIp: string,
  origins: string[],
): Promise<boolean> {
  const ip = stripIpv4Mapped(clientIp);

  if (!ip) {
    return false;
  }

  for (const raw of origins) {
    const origin = raw.trim();

    if (!origin || origin === '*') {
      continue;
    }

    if (net.isIP(origin)) {
      if (stripIpv4Mapped(origin) === ip) {
        return true;
      }

      continue;
    }

    const reverseHosts = await dns.reverse(ip).catch(() => [] as string[]);

    if (hostnameMatches(origin, reverseHosts)) {
      return true;
    }

    const resolved = await dns
      .lookup(origin, { all: true })
      .then((entries) => entries.map((entry) => entry.address))
      .catch(() => [] as string[]);

    if (resolved.some((address) => stripIpv4Mapped(address) === ip)) {
      return true;
    }
  }

  return false;
}

export function resolveClientIp(request: {
  ip?: string;
  socket?: { remoteAddress?: string };
}): string | undefined {
  const raw = request.ip || request.socket?.remoteAddress;

  return raw ? stripIpv4Mapped(raw) : undefined;
}
