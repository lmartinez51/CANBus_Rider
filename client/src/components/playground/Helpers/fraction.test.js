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

  describe('roundTo', () => {
    test('rounds rational numbers to string fractions (e.g., 0.9 roundTo "1/8" => 7/8)', () => {
      const f = new Fraction('0.9');
      const res = f.roundTo('1/8');
      expect(res.n).toBe(7);
      expect(res.d).toBe(8);
      expect(res.s).toBe(1);
      expect(res.toFraction()).toBe('7/8');
    });

    test('rounds rational numbers when passed fraction as two parameters (numerator, denominator)', () => {
      const f = new Fraction(9, 10); // 0.9
      const res = f.roundTo(1, 8); // 1/8
      expect(res.n).toBe(7);
      expect(res.d).toBe(8);
    });

    test('rounds rational numbers when passed Fraction instance', () => {
      const f = new Fraction(4, 3); // 1.333...
      const step = new Fraction(1, 2); // 0.5
      const res = f.roundTo(step); // 1.333 rounded to nearest 0.5 is 1.5 => 3/2
      expect(res.n).toBe(3);
      expect(res.d).toBe(2);
    });

    test('rounds rational numbers when passed array format or object format', () => {
      const f = new Fraction(0.8);
      const resArr = f.roundTo([1, 4]); // step 1/4 (0.25) => 0.75 (3/4)
      expect(resArr.toFraction()).toBe('3/4');

      const resObj = f.roundTo({ n: 1, d: 4 });
      expect(resObj.toFraction()).toBe('3/4');
    });

    test('handles negative fractions and negative rounding steps', () => {
      const fNeg = new Fraction(-0.9);
      const resNeg = fNeg.roundTo('1/8'); // -0.9 rounded to 1/8 step => -7/8
      expect(resNeg.s).toBe(-1);
      expect(resNeg.toFraction()).toBe('-7/8');

      const fPos = new Fraction(0.9);
      const resNegStep = fPos.roundTo('-1/8'); // step is negative -1/8 => 7/8
      expect(resNegStep.toFraction()).toBe('7/8');
    });

    test('handles exact multiples without changing value', () => {
      const f = new Fraction(3, 4);
      const res = f.roundTo('1/4');
      expect(res.n).toBe(3);
      expect(res.d).toBe(4);
      expect(res.equals(f)).toBe(true);
    });

    test('returns Fraction(NaN) when rounding step numerator is 0', () => {
      const f = new Fraction(1, 2);
      const res = f.roundTo(0);
      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });

    test('throws Error when denominator is zero', () => {
      const f = new Fraction(1, 2);
      expect(() => f.roundTo(1, 0)).toThrow('Division by Zero');
    });

    test('throws Error when invalid parameter is passed', () => {
      const f = new Fraction(1, 2);
      expect(() => f.roundTo('invalid')).toThrow('Invalid argument');
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
