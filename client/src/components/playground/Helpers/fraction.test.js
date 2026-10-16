import Fraction from './fraction';

describe('Fraction.prototype.valueOf', () => {
  describe('Happy path - standard fraction calculations', () => {
    test('returns correct decimal value for positive integer fractions', () => {
      const f1 = new Fraction(1, 2);
      expect(f1.valueOf()).toBe(0.5);

      const f2 = new Fraction(3, 4);
      expect(f2.valueOf()).toBe(0.75);

      const f3 = new Fraction(5, 1);
      expect(f3.valueOf()).toBe(5);
    });

    test('returns correct decimal value for zero fraction', () => {
      const f = new Fraction(0, 1);
      expect(f.valueOf()).toBe(0);
    });

    test('returns correct decimal value for negative fractions', () => {
      const f1 = new Fraction(-1, 2);
      expect(f1.valueOf()).toBe(-0.5);

      const f2 = new Fraction(1, -4);
      expect(f2.valueOf()).toBe(-0.25);

      const f3 = new Fraction(-3, -4);
      expect(f3.valueOf()).toBe(0.75);
    });

    test('returns correct decimal value for decimal strings and repeating decimals', () => {
      const f1 = new Fraction("100.'91823'");
      expect(f1.valueOf()).toBeCloseTo(100.91823918239183, 10);

      const f2 = new Fraction('0.5');
      expect(f2.valueOf()).toBe(0.5);

      const f3 = new Fraction('1/3');
      expect(f3.valueOf()).toBeCloseTo(1 / 3, 10);
    });

    test('returns correct decimal value for object representation', () => {
      const f = new Fraction({ n: 3, d: 4, s: -1 });
      expect(f.valueOf()).toBe(-0.75);
    });
  });

  describe('Implicit type coercion using valueOf', () => {
    test('coerces to number with unary plus operator', () => {
      const f = new Fraction(3, 4);
      expect(+f).toBe(0.75);
    });

    test('works with arithmetic operations', () => {
      const f = new Fraction(1, 4);
      expect(f + 2).toBe(2.25);
      expect(f * 4).toBe(1);
    });

    test('works in comparisons', () => {
      const f1 = new Fraction(1, 2);
      const f2 = new Fraction(3, 4);
      expect(f1 < f2).toBe(true);
      expect(f2 > f1).toBe(true);
    });
  });

  describe('Edge cases', () => {
    test('returns NaN when fraction is created with NaN', () => {
      const f = new Fraction(NaN);
      expect(f.valueOf()).toBeNaN();
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

  describe('compare', () => {
    test('returns 0 when two fractions are equal', () => {
      const f = new Fraction(1, 2);
      expect(f.compare(1, 2)).toBe(0);
      expect(f.compare(2, 4)).toBe(0);
      expect(f.compare([1, 2])).toBe(0);
      expect(f.compare('0.5')).toBe(0);
      expect(f.compare({ n: 1, d: 2 })).toBe(0);
      expect(f.compare(new Fraction(1, 2))).toBe(0);
      expect(new Fraction(-1, 2).compare(-1, 2)).toBe(0);
      expect(new Fraction(0).compare(0)).toBe(0);
    });

    test('returns 1 when current fraction is greater than the target', () => {
      const f = new Fraction(3, 4);
      expect(f.compare(1, 2)).toBe(1);
      expect(new Fraction(1, 2).compare(-1, 2)).toBe(1);
      expect(new Fraction(-1, 4).compare(-1, 2)).toBe(1);
      expect(new Fraction(1, 2).compare(0)).toBe(1);
    });

    test('returns -1 when current fraction is less than the target', () => {
      const f = new Fraction(1, 4);
      expect(f.compare(1, 2)).toBe(-1);
      expect(new Fraction(-1, 2).compare(1, 2)).toBe(-1);
      expect(new Fraction(-1, 2).compare(-1, 4)).toBe(-1);
      expect(new Fraction(-1, 2).compare(0)).toBe(-1);
    });
  });
});
