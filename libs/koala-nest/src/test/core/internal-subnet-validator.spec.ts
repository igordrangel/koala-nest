import { describe, expect, it } from 'bun:test';
import { InternalSubnetValidator } from '@/core/utils/internal-subnet-validator';

describe('InternalSubnetValidator', () => {
  it('aceita IPv4 privados', () => {
    expect(InternalSubnetValidator.validate('10.0.0.5')).toBe(true);
    expect(InternalSubnetValidator.validate('172.16.1.1')).toBe(true);
    expect(InternalSubnetValidator.validate('192.168.0.10')).toBe(true);
    expect(InternalSubnetValidator.validate('::ffff:10.1.2.3')).toBe(true);
  });

  it('rejeita IPv4 públicos', () => {
    expect(InternalSubnetValidator.validate('203.0.113.10')).toBe(false);
    expect(InternalSubnetValidator.validate('8.8.8.8')).toBe(false);
  });
});
