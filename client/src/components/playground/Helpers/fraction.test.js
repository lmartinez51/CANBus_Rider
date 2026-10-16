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
    describe('Default rounding (places parameter omitted or 0)', () => {
      test('rounds positive fractions down when fractional part < 0.5', () => {
        const f = new Fraction('4.(3)'); // 4.333...
        const rounded = f.round();
        expect(rounded).toBeInstanceOf(Fraction);
        expect(rounded.n).toBe(4);
        expect(rounded.d).toBe(1);
        expect(rounded.s).toBe(1);
        expect(rounded.toFraction()).toBe('4');
        expect(rounded.valueOf()).toBe(4);
      });

      test('rounds positive fractions up when fractional part >= 0.5', () => {
        const f = new Fraction('4.(6)'); // 4.666...
        const rounded = f.round();
        expect(rounded).toBeInstanceOf(Fraction);
        expect(rounded.n).toBe(5);
        expect(rounded.d).toBe(1);
        expect(rounded.s).toBe(1);
        expect(rounded.toFraction()).toBe('5');
        expect(rounded.valueOf()).toBe(5);
      });

      test('rounds exact half values up for positive numbers', () => {
        const f = new Fraction(1, 2); // 0.5
        const rounded = f.round();
        expect(rounded.valueOf()).toBe(1);
      });

      test('rounds negative fractions correctly', () => {
        const f1 = new Fraction(-4.3);
        const rounded1 = f1.round();
        expect(rounded1.n).toBe(4);
        expect(rounded1.d).toBe(1);
        expect(rounded1.s).toBe(-1);
        expect(rounded1.toFraction()).toBe('-4');
        expect(rounded1.valueOf()).toBe(-4);

        const f2 = new Fraction(-4.6);
        const rounded2 = f2.round();
        expect(rounded2.valueOf()).toBe(-5);
      });

      test('handles 0 explicit places argument', () => {
        const f = new Fraction('2.718');
        const rounded = f.round(0);
        expect(rounded.valueOf()).toBe(3);
        expect(rounded.n).toBe(3);
        expect(rounded.d).toBe(1);
      });
    });

    describe('Rounding to specified positive decimal places', () => {
      test('rounds to 1 decimal place', () => {
        const f1 = new Fraction('3.14159');
        const rounded1 = f1.round(1);
        expect(rounded1.valueOf()).toBe(3.1);

        const f2 = new Fraction('3.16159');
        const rounded2 = f2.round(1);
        expect(rounded2.valueOf()).toBe(3.2);
      });

      test('rounds to 2 and 3 decimal places', () => {
        const f = new Fraction('4.3456');
        const rounded2 = f.round(2);
        expect(rounded2.valueOf()).toBe(4.35);

        const rounded3 = f.round(3);
        expect(rounded3.valueOf()).toBe(4.346);
      });

      test('rounds repeating decimals to specified places', () => {
        const f = new Fraction('1/3'); // 0.333...
        const rounded2 = f.round(2);
        expect(rounded2.valueOf()).toBe(0.33);

        const f2 = new Fraction('2/3'); // 0.666...
        const rounded2_2 = f2.round(2);
        expect(rounded2_2.valueOf()).toBe(0.67);
      });

      test('handles negative fractions with positive decimal places', () => {
        const f = new Fraction(-4.3456);
        const rounded2 = f.round(2);
        expect(rounded2.valueOf()).toBe(-4.35);
      });
    });

    describe('Rounding with special values and edge cases', () => {
      test('handles zero fraction', () => {
        const f = new Fraction(0);
        const roundedDefault = f.round();
        expect(roundedDefault.n).toBe(0);
        expect(roundedDefault.d).toBe(1);
        expect(roundedDefault.valueOf()).toBe(0);

        const roundedPlaces = f.round(2);
        expect(roundedPlaces.n).toBe(0);
        expect(roundedPlaces.d).toBe(1);
        expect(roundedPlaces.valueOf()).toBe(0);
      });

      test('returns Fraction(NaN) when current fraction is NaN', () => {
        const nanFraction = new Fraction(NaN);
        const resDefault = nanFraction.round();

        expect(resDefault).toBeInstanceOf(Fraction);
        expect(Number.isNaN(resDefault.n)).toBe(true);
        expect(Number.isNaN(resDefault.d)).toBe(true);
        expect(resDefault.toString()).toBe('NaN');

        const resWithPlaces = nanFraction.round(2);
        expect(resWithPlaces).toBeInstanceOf(Fraction);
        expect(Number.isNaN(resWithPlaces.n)).toBe(true);
        expect(Number.isNaN(resWithPlaces.d)).toBe(true);
        expect(resWithPlaces.toString()).toBe('NaN');
      });

      test('handles null or undefined places parameter gracefully', () => {
        const f = new Fraction('3.7');
        expect(f.round(undefined).valueOf()).toBe(4);
        expect(f.round(null).valueOf()).toBe(4);
      });

      test('preserves immutability of original Fraction instance', () => {
        const f = new Fraction('4.(3)');
        const originalN = f.n;
        const originalD = f.d;
        const originalS = f.s;

        f.round(2);

        expect(f.n).toBe(originalN);
        expect(f.d).toBe(originalD);
        expect(f.s).toBe(originalS);
      });
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

  describe('inverse', () => {
    test('inverts a standard positive fraction', () => {
      const f = new Fraction(3, 4);
      const inv = f.inverse();
      expect(inv).toBeInstanceOf(Fraction);
      expect(inv.n).toBe(4);
      expect(inv.d).toBe(3);
      expect(inv.s).toBe(1);
      expect(inv.valueOf()).toBeCloseTo(4 / 3);
      expect(inv.toFraction()).toBe('4/3');
    });

    test('inverts a whole number fraction with denominator 1', () => {
      const f = new Fraction(5, 1);
      const inv = f.inverse();
      expect(inv.n).toBe(1);
      expect(inv.d).toBe(5);
      expect(inv.s).toBe(1);
      expect(inv.valueOf()).toBe(0.2);
      expect(inv.toFraction()).toBe('1/5');
    });

    test('inverts negative fractions correctly', () => {
      const f1 = new Fraction(-3, 4);
      const inv1 = f1.inverse();
      expect(inv1.n).toBe(4);
      expect(inv1.d).toBe(3);
      expect(inv1.s).toBe(-1);
      expect(inv1.valueOf()).toBeCloseTo(-4 / 3);
      expect(inv1.toFraction()).toBe('-4/3');

      const f2 = new Fraction(1, -4);
      const inv2 = f2.inverse();
      expect(inv2.n).toBe(4);
      expect(inv2.d).toBe(1);
      expect(inv2.s).toBe(-1);
      expect(inv2.valueOf()).toBe(-4);
      expect(inv2.toFraction()).toBe('-4');
    });

    test('inverts fractions initialized from string and array forms', () => {
      const fArray = new Fraction([-3, 4]);
      const invArray = fArray.inverse();
      expect(invArray.n).toBe(4);
      expect(invArray.d).toBe(3);
      expect(invArray.s).toBe(-1);

      const fString = new Fraction('0.25');
      const invString = fString.inverse();
      expect(invString.n).toBe(4);
      expect(invString.d).toBe(1);
      expect(invString.s).toBe(1);
      expect(invString.valueOf()).toBe(4);
    });

    test('double inversion returns equal fraction', () => {
      const f = new Fraction(7, 11);
      const doubleInv = f.inverse().inverse();
      expect(doubleInv.equals(f)).toBe(true);
      expect(doubleInv.n).toBe(f.n);
      expect(doubleInv.d).toBe(f.d);
      expect(doubleInv.s).toBe(f.s);
    });

    test('does not mutate the original fraction instance', () => {
      const f = new Fraction(2, 5);
      const inv = f.inverse();
      expect(f.n).toBe(2);
      expect(f.d).toBe(5);
      expect(f.s).toBe(1);
      expect(inv.n).toBe(5);
      expect(inv.d).toBe(2);
    });

    test('throws Division by Zero error when inverting zero fraction', () => {
      const f = new Fraction(0, 1);
      expect(() => f.inverse()).toThrow('Division by Zero');
    });

    test('returns Fraction with NaN components when inverting NaN fraction', () => {
      const nanFraction = new Fraction(NaN);
      const inv = nanFraction.inverse();
      expect(inv).toBeInstanceOf(Fraction);
      expect(Number.isNaN(inv.n)).toBe(true);
      expect(Number.isNaN(inv.d)).toBe(true);
      expect(Number.isNaN(inv.valueOf())).toBe(true);
    });
  });

  describe('ceil', () => {
    test('calculates ceil of a positive fraction to 0 decimal places by default', () => {
      const f = new Fraction('4.(3)'); // 4 + 1/3
      const ceiled = f.ceil();
      expect(ceiled.n).toBe(5);
      expect(ceiled.d).toBe(1);
      expect(ceiled.s).toBe(1);
      expect(ceiled.toFraction()).toBe('5');
    });

    test('calculates ceil of an integer fraction without change', () => {
      const f = new Fraction(4, 2); // 2
      const ceiled = f.ceil();
      expect(ceiled.n).toBe(2);
      expect(ceiled.d).toBe(1);
      expect(ceiled.s).toBe(1);
      expect(ceiled.toFraction()).toBe('2');
    });

    test('calculates ceil of a negative fraction correctly', () => {
      const f1 = new Fraction(-4.3);
      const ceiled1 = f1.ceil();
      expect(ceiled1.n).toBe(4);
      expect(ceiled1.d).toBe(1);
      expect(ceiled1.s).toBe(-1);
      expect(ceiled1.toFraction()).toBe('-4');

      const f2 = new Fraction(-4.8);
      const ceiled2 = f2.ceil();
      expect(ceiled2.n).toBe(4);
      expect(ceiled2.d).toBe(1);
      expect(ceiled2.s).toBe(-1);
      expect(ceiled2.toFraction()).toBe('-4');
    });

    test('calculates ceil to specified decimal places', () => {
      const f = new Fraction('4.3412');
      const ceiled2 = f.ceil(2);
      expect(ceiled2.valueOf()).toBe(4.35);

      const negF = new Fraction('-4.3456');
      const negCeiled2 = negF.ceil(2);
      expect(negCeiled2.valueOf()).toBe(-4.34);
    });

    test('handles zero fraction', () => {
      const f = new Fraction(0);
      const ceiled = f.ceil(2);
      expect(ceiled.n).toBe(0);
      expect(ceiled.d).toBe(1);
      expect(ceiled.valueOf()).toBe(0);
    });

    test('returns Fraction(NaN) when current fraction is NaN', () => {
      const nanFraction = new Fraction(NaN);
      const res = nanFraction.ceil(2);

      expect(res).toBeInstanceOf(Fraction);
      expect(Number.isNaN(res.n)).toBe(true);
      expect(Number.isNaN(res.d)).toBe(true);
      expect(res.toString()).toBe('NaN');
    });
  });
});
