import { z } from 'zod';

function parseBoolean(value: unknown) {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return undefined;
}

export function booleanSchema() {
  return z.preprocess(parseBoolean, z.boolean().optional());
}

export function envBooleanSchema(defaultValue = false) {
  return z.preprocess(
    (value) => parseBoolean(value) ?? defaultValue,
    z.boolean(),
  );
}
