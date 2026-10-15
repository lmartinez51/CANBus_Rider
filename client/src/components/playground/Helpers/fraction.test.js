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
});
