import { afterAll, beforeAll, vi } from 'vitest';

const originalDebug = console.debug;

beforeAll(() => {
  vi.spyOn(console, 'debug').mockImplementation(() => undefined);
});

afterAll(() => {
  console.debug = originalDebug;
});
