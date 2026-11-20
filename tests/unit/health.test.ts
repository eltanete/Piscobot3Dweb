import { describe, expect, it } from 'vitest';
import { GET } from '../../src/pages/api/health';

describe('GET /api/health', () => {
  it('responde ok en JSON', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET({} as any);
    expect(res.headers.get('Content-Type')).toBe('application/json');
    expect(await res.json()).toMatchObject({ ok: true });
  });
});
