import Fraction from './fraction';

describe('Fraction.prototype.valueOf', () => {
  describe('Return type', () => {
    test('returns a primitive number', () => {
      const f = new Fraction(3, 4);
      expect(typeof f.valueOf()).toBe('number');
    });
  });

  describe('Happy path - standard fraction calculations', () => {
    test('returns correct decimal value for positive integer and fractional values', () => {
      const f1 = new Fraction(1, 2);
      expect(f1.valueOf()).toBe(0.5);

      const f2 = new Fraction(3, 4);
      expect(f2.valueOf()).toBe(0.75);

      const f3 = new Fraction(5, 1);
      expect(f3.valueOf()).toBe(5);

      const f4 = new Fraction(7, 4);
      expect(f4.valueOf()).toBe(1.75);

      const f5 = new Fraction(0);
      expect(f5.valueOf()).toBe(0);
    });

    test('returns correct decimal value for zero fraction', () => {
      const f1 = new Fraction(0, 1);
      expect(f1.valueOf()).toBe(0);

      const f2 = new Fraction(0, 5);
      expect(f2.valueOf()).toBe(0);
    });

    test('returns correct decimal value for negative fractions', () => {
      const f1 = new Fraction(-1, 2);
      expect(f1.valueOf()).toBe(-0.5);

      const f2 = new Fraction(1, -4);
      expect(f2.valueOf()).toBe(-0.25);

      const f3 = new Fraction(-3, -4);
      expect(f3.valueOf()).toBe(0.75);
    });

    test('returns correct decimal value for string representations', () => {
      const f1 = new Fraction("100.'91823'");
      expect(f1.valueOf()).toBeCloseTo(100.91823918239183, 10);

      const f2 = new Fraction('0.5');
      expect(f2.valueOf()).toBe(0.5);

      const f3 = new Fraction('1/3');
      expect(f3.valueOf()).toBeCloseTo(1 / 3, 10);

      const f4 = new Fraction('123 1/2');
      expect(f4.valueOf()).toBe(123.5);

      const f5 = new Fraction('4.(3)');
      expect(f5.valueOf()).toBeCloseTo(4.333333333333333, 10);
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
      expect(f - 0.25).toBe(0);
      expect(f * 4).toBe(1);
      expect(f / 2).toBe(0.125);
      expect(f % 0.2).toBeCloseTo(0.05, 10);
    });

    test('works with Math standard library functions', () => {
      const f = new Fraction(16, 9);
      expect(Math.sqrt(f)).toBeCloseTo(4 / 3, 10);
      expect(Math.abs(new Fraction(-5, 2))).toBe(2.5);
    });

    test('works in comparisons', () => {
      const f1 = new Fraction(1, 2);
      const f2 = new Fraction(3, 4);
      expect(f1 < f2).toBe(true);
      expect(f2 > f1).toBe(true);
      expect(f1 <= f2).toBe(true);
      expect(f2 >= f1).toBe(true);
      expect(f1.valueOf() === 0.5).toBe(true);
    });
  });

  describe('Edge cases and direct state evaluations', () => {
    test('returns NaN when fraction is created with NaN', () => {
      const f = new Fraction(NaN);
      expect(f.valueOf()).toBeNaN();
    });

    test('evaluates correctly based on internal s, n, and d properties when modified', () => {
      const f = new Fraction(1, 2);
      f.s = -1;
      f.n = 3;
      f.d = 4;
      expect(f.valueOf()).toBe(-0.75);
    });

    test('handles small fractional values without loss of precision', () => {
      const fSmall = new Fraction(1, 1000000);
      expect(fSmall.valueOf()).toBe(0.000001);
    });
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
