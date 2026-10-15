import Fraction from './fraction';

describe('Fraction', () => {
  describe('gcd', () => {
    test('calculates fractional gcd of two rational numbers', () => {
      // Ex: new Fraction(5,8).gcd(3,7) => 1/56
      const f1 = new Fraction(5, 8);
      const res = f1.gcd(3, 7);
      expect(res.n).toBe(1);
      expect(res.d).toBe(56);
      expect(res.toFraction()).toBe('1/56');
    });

    test('calculates gcd with Fraction object argument', () => {
      const f1 = new Fraction(5, 8);
      const f2 = new Fraction(3, 7);
      const res = f1.gcd(f2);
      expect(res.n).toBe(1);
      expect(res.d).toBe(56);
    });

    test('calculates gcd with integer argument', () => {
      // new Fraction(1, 2).gcd(3) => gcd(1/2, 3/1) = gcd(1,3)/lcm(2,1) = 1/2
      const f1 = new Fraction(1, 2);
      const res = f1.gcd(3);
      expect(res.n).toBe(1);
      expect(res.d).toBe(2);
    });

    test('calculates gcd with string fraction argument', () => {
      const f1 = new Fraction(5, 8);
      const res = f1.gcd('3/7');
      expect(res.n).toBe(1);
      expect(res.d).toBe(56);
    });

    test('calculates gcd with array argument', () => {
      const f1 = new Fraction(5, 8);
      const res = f1.gcd([3, 7]);
      expect(res.n).toBe(1);
      expect(res.d).toBe(56);
    });

    test('calculates gcd when one fraction is zero', () => {
      // gcd(0, 3/4) = 3/4
      const f1 = new Fraction(0);
      const res = f1.gcd(3, 4);
      expect(res.n).toBe(3);
      expect(res.d).toBe(4);
    });

    test('calculates gcd when second fraction is zero', () => {
      // gcd(3/4, 0) = 3/4
      const f1 = new Fraction(3, 4);
      const res = f1.gcd(0);
      expect(res.n).toBe(3);
      expect(res.d).toBe(4);
    });

    test('calculates gcd with negative fractions (returns positive fraction result)', () => {
      // gcd(-5/8, 3/7) = 1/56
      const f1 = new Fraction(-5, 8);
      const res = f1.gcd(3, 7);
      expect(res.s).toBe(1);
      expect(res.n).toBe(1);
      expect(res.d).toBe(56);
    });

    test('calculates gcd when both fractions are identical', () => {
      const f1 = new Fraction(3, 4);
      const res = f1.gcd(3, 4);
      expect(res.n).toBe(3);
      expect(res.d).toBe(4);
    });

    test('calculates gcd for whole numbers', () => {
      // gcd(12, 18) = 6
      const f1 = new Fraction(12);
      const res = f1.gcd(18);
      expect(res.n).toBe(6);
      expect(res.d).toBe(1);
    });

    test('throws Invalid argument for invalid parameter in gcd', () => {
      const f1 = new Fraction(1, 2);
      expect(() => f1.gcd('invalid')).toThrow('Invalid argument');
    });
  });

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
