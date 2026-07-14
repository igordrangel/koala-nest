import net from 'node:net';

/**
 * Libera IPs de redes privadas (RFC1918 / IPv6 ULA e link-local).
 * Útil para hops HTTP entre pods no mesmo cluster — opcional via CLI.
 */
export class InternalSubnetValidator {
  static validate(ip: string): boolean {
    let normalized = ip;

    if (normalized.substring(0, 7) === '::ffff:') {
      normalized = normalized.substring(7);
    }

    if (net.isIPv4(normalized)) {
      return (
        /^(10)\.(.*)\.(.*)\.(.*)$/.test(normalized) ||
        /^(172)\.(1[6-9]|2[0-9]|3[0-1])\.(.*)\.(.*)$/.test(normalized) ||
        /^(192)\.(168)\.(.*)\.(.*)$/.test(normalized)
      );
    }

    const firstWord = normalized.split(':').find((el) => !!el) ?? '';

    if (/^fe[c-f][0-f]$/.test(firstWord)) {
      return true;
    }

    if (/^fc[0-f]{2}$/.test(firstWord)) {
      return true;
    }

    if (/^fd[0-f]{2}$/.test(firstWord)) {
      return true;
    }

    if (firstWord === 'fe80') {
      return true;
    }

    if (firstWord === '100') {
      return true;
    }

    return false;
  }
}
