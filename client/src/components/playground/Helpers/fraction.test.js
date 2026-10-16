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

  describe('gcd', () => {
    describe('Happy path - standard fraction calculations', () => {
      test('calculates gcd of two standard irreducible fractions (5/8 and 3/7)', () => {
        const res = new Fraction(5, 8).gcd(3, 7);
        expect(res.toFraction()).toBe('1/56');
        expect(res.n).toBe(1);
        expect(res.d).toBe(56);
        expect(res.s).toBe(1);
      });

      test('calculates gcd of fractions that simplify (5/6 and 15/8)', () => {
        const res = new Fraction(5, 6).gcd(15, 8);
        expect(res.toFraction()).toBe('5/24');
        expect(res.n).toBe(5);
        expect(res.d).toBe(24);
      });

      test('calculates gcd of identical fractions', () => {
        const res = new Fraction(3, 4).gcd(3, 4);
        expect(res.toFraction()).toBe('3/4');
      });

      test('calculates gcd when one fraction divides the other', () => {
        const res = new Fraction(1, 2).gcd(1, 4);
        expect(res.toFraction()).toBe('1/4');
      });

      test('calculates gcd of whole integers', () => {
        const res = new Fraction(12).gcd(18);
        expect(res.toFraction()).toBe('6');
        expect(res.valueOf()).toBe(6);
      });
    });

    describe('Input formats supported by parse(a, b)', () => {
      test('accepts two numeric arguments (numerator, denominator)', () => {
        const res = new Fraction(5, 8).gcd(3, 7);
        expect(res.toFraction()).toBe('1/56');
      });

      test('accepts a single integer', () => {
        const res = new Fraction(6, 7).gcd(2);
        expect(res.toFraction()).toBe('2/7');
      });

      test('accepts a single double/float', () => {
        const res = new Fraction(1, 2).gcd(0.25);
        expect(res.toFraction()).toBe('1/4');
      });

      test('accepts another Fraction instance', () => {
        const f1 = new Fraction(5, 8);
        const f2 = new Fraction(3, 7);
        const res = f1.gcd(f2);
        expect(res.toFraction()).toBe('1/56');
      });

      test('accepts object input with {n, d}', () => {
        const res = new Fraction(5, 8).gcd({ n: 3, d: 7 });
        expect(res.toFraction()).toBe('1/56');
      });

      test('accepts object input with {n, d, s}', () => {
        const res = new Fraction(5, 8).gcd({ n: 3, d: 7, s: 1 });
        expect(res.toFraction()).toBe('1/56');
      });

      test('accepts fraction string input', () => {
        const res = new Fraction(5, 8).gcd('3/7');
        expect(res.toFraction()).toBe('1/56');
      });

      test('accepts reduced fraction string input', () => {
        const res = new Fraction(1, 2).gcd('1/4');
        expect(res.toFraction()).toBe('1/4');
      });

      test('accepts array format input [n, d]', () => {
        const res = new Fraction(5, 8).gcd([3, 7]);
        expect(res.toFraction()).toBe('1/56');
      });
    });

    describe('Edge cases and error handling', () => {
      test('handles zero fraction on caller or argument', () => {
        const zeroCall = new Fraction(0, 1).gcd(5, 6);
        expect(zeroCall.toFraction()).toBe('5/6');

        const zeroArg = new Fraction(5, 6).gcd(0, 1);
        expect(zeroArg.toFraction()).toBe('5/6');

        const bothZero = new Fraction(0, 1).gcd(0, 1);
        expect(bothZero.toFraction()).toBe('0');
        expect(bothZero.valueOf()).toBe(0);
      });

      test('returns positive GCD when fractions are negative', () => {
        const res1 = new Fraction(-5, 8).gcd(3, 7);
        expect(res1.toFraction()).toBe('1/56');
        expect(res1.s).toBe(1);

        const res2 = new Fraction(5, 8).gcd(-3, 7);
        expect(res2.toFraction()).toBe('1/56');
        expect(res2.s).toBe(1);

        const res3 = new Fraction(-5, 8).gcd(-3, 7);
        expect(res3.toFraction()).toBe('1/56');
        expect(res3.s).toBe(1);
      });

      test('throws Division by Zero error when denominator is zero', () => {
        expect(() => {
          new Fraction(1, 2).gcd(1, 0);
        }).toThrow('Division by Zero');
      });

      test('throws Parameters must be integer error when non-integer values passed in 2-arg signature', () => {
        expect(() => {
          new Fraction(1, 2).gcd(1.5, 2);
        }).toThrow('Parameters must be integer');
      });

      test('throws Invalid argument error when invalid string or object passed', () => {
        expect(() => {
          new Fraction(1, 2).gcd('abc');
        }).toThrow('Invalid argument');

        expect(() => {
          new Fraction(1, 2).gcd({});
        }).toThrow('Invalid argument');
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
});
