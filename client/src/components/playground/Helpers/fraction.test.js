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

  describe('valueOf', () => {
    test('returns numeric value of basic positive and negative fractions', () => {
      expect(new Fraction(1, 2).valueOf()).toBe(0.5);
      expect(new Fraction(-3, 4).valueOf()).toBe(-0.75);
    });

    test('returns whole integer value when denominator is 1', () => {
      expect(new Fraction(5, 1).valueOf()).toBe(5);
      expect(new Fraction(0, 1).valueOf()).toBe(0);
    });

    test('returns correct decimal value for repeating decimal strings', () => {
      const f = new Fraction("100.'91823'");
      expect(f.valueOf()).toBeCloseTo(100.91823918239183);
    });

    test('allows implicit numeric coercion via JS operators', () => {
      const f1 = new Fraction(3, 4);
      const f2 = new Fraction(1, 4);

      expect(+f1).toBe(0.75);
      expect(f1 + f2).toBe(1);
      expect(f1 * 2).toBe(1.5);
    });

    test('returns NaN for NaN fraction', () => {
      const nanFraction = new Fraction(NaN);
      expect(Number.isNaN(nanFraction.valueOf())).toBe(true);
    });
  });
});
