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

  describe('floor', () => {
    test('calculates floor of positive rational numbers', () => {
      const f1 = new Fraction('4.(3)');
      const res1 = f1.floor();
      expect(res1.n).toBe(4);
      expect(res1.d).toBe(1);
      expect(res1.s).toBe(1);

      const f2 = new Fraction(7, 2);
      const res2 = f2.floor();
      expect(res2.n).toBe(3);
      expect(res2.d).toBe(1);
      expect(res2.s).toBe(1);
    });

    test('calculates floor of negative rational numbers', () => {
      const f1 = new Fraction(-7, 2); // -3.5
      const res1 = f1.floor();
      expect(res1.n).toBe(4);
      expect(res1.d).toBe(1);
      expect(res1.s).toBe(-1);
      expect(res1.valueOf()).toBe(-4);

      const f2 = new Fraction('-4.(3)');
      const res2 = f2.floor();
      expect(res2.n).toBe(5);
      expect(res2.d).toBe(1);
      expect(res2.s).toBe(-1);
      expect(res2.valueOf()).toBe(-5);
    });

    test('calculates floor with specified decimal places', () => {
      const f = new Fraction('4.326');
      const res = f.floor(2);
      // 4.326 floor to 2 places => 4.32 => 432 / 100 = 108 / 25
      expect(res.valueOf()).toBe(4.32);
      expect(res.n).toBe(108);
      expect(res.d).toBe(25);
    });

    test('calculates floor of integer and zero values', () => {
      const zero = new Fraction(0);
      const resZero = zero.floor();
      expect(resZero.n).toBe(0);
      expect(resZero.d).toBe(1);

      const int = new Fraction(5);
      const resInt = int.floor();
      expect(resInt.n).toBe(5);
      expect(resInt.d).toBe(1);
    });

    test('returns Fraction(NaN) when calling floor on NaN fraction', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.floor();

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });
  });
});
