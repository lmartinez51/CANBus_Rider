import Fraction from './fraction';

describe('Fraction', () => {
  describe('mod', () => {
    test('calculates modulo of valid fractions', () => {
      const f1 = new Fraction(7, 2);
      const res = f1.mod(3);
      expect(res.n).toBe(1);
      expect(res.d).toBe(2);
      expect(res.toString()).toBe('0.5');
    });

    test('returns Fraction(NaN) when current fraction is NaN (no args)', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.mod();

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });

    test('returns Fraction(NaN) when current fraction is NaN with a single arg', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.mod(2);

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });

    test('returns Fraction(NaN) when current fraction is NaN with two args', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.mod(1, 2);

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });

    test('returns Fraction(NaN) when current fraction is NaN with Fraction arg', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.mod(new Fraction(2, 3));

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });

    test('returns Fraction(NaN) when calling mod with NaN on a valid fraction', () => {
      const validFraction = new Fraction(5, 2);
      const res = validFraction.mod(NaN);

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });
  });

  describe('round', () => {
    test('rounds a positive fraction to 0 decimal places by default', () => {
      const f = new Fraction('4.(3)'); // 4 + 1/3
      const rounded = f.round();
      expect(rounded.n).toBe(4);
      expect(rounded.d).toBe(1);
      expect(rounded.s).toBe(1);
      expect(rounded.toFraction()).toBe('4');
    });

    test('rounds a repeating decimal fraction up when fractional part >= 0.5', () => {
      const f = new Fraction('4.(6)'); // 4 + 2/3 ≈ 4.666...
      const rounded = f.round();
      expect(rounded.n).toBe(5);
      expect(rounded.d).toBe(1);
      expect(rounded.s).toBe(1);
      expect(rounded.toFraction()).toBe('5');
    });

    test('rounds a negative fraction correctly', () => {
      const f = new Fraction(-4.3);
      const rounded = f.round();
      expect(rounded.n).toBe(4);
      expect(rounded.d).toBe(1);
      expect(rounded.s).toBe(-1);
      expect(rounded.toFraction()).toBe('-4');
    });

    test('rounds to specified decimal places', () => {
      const f = new Fraction('4.3456');
      const rounded2 = f.round(2);
      expect(rounded2.valueOf()).toBe(4.35);

      const rounded3 = f.round(3);
      expect(rounded3.valueOf()).toBe(4.346);
    });

    test('handles zero fraction', () => {
      const f = new Fraction(0);
      const rounded = f.round(2);
      expect(rounded.n).toBe(0);
      expect(rounded.d).toBe(1);
      expect(rounded.valueOf()).toBe(0);
    });

    test('returns Fraction(NaN) when current fraction is NaN', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.round(2);

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });
  });
});
