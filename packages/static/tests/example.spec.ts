import { test } from '@japa/runner';

test.group('Static / Example', () => {
  test('isTrue(true)', ({ expect }: any) => {
    expect(true).toBe(true);
  });
});