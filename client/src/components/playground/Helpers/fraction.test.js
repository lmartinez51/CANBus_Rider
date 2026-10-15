import Fraction from './fraction';

describe('Fraction.prototype.round', () => {
  describe('default places (0 decimal places)', () => {
    test('rounds a repeating decimal fraction to nearest integer', () => {
      // 4.(3) = 4 + 1/3 = 13/3 ~= 4.333... -> rounded to 4
      const f = new Fraction('4.(3)');
      const rounded = f.round();
      expect(rounded.valueOf()).toBe(4);
      expect(rounded.n).toBe(4);
      expect(rounded.d).toBe(1);
    });

    test('rounds positive fractions up when fraction >= 0.5', () => {
      // 4.5 = 9/2 -> rounded to 5
      const f = new Fraction(9, 2);
      const rounded = f.round();
      expect(rounded.valueOf()).toBe(5);
      expect(rounded.n).toBe(5);
      expect(rounded.d).toBe(1);
    });

    test('rounds positive fractions down when fraction < 0.5', () => {
      // 4.4 = 22/5 -> rounded to 4
      const f = new Fraction('4.4');
      const rounded = f.round();
      expect(rounded.valueOf()).toBe(4);
    });

    test('rounds negative fractions correctly', () => {
      // -4.3 -> rounded to -4
      const f1 = new Fraction('-4.3');
      expect(f1.round().valueOf()).toBe(-4);

      // Math.round(-4.5) in JS is -4
      const f2 = new Fraction('-4.5');
      expect(f2.round().valueOf()).toBe(-4);

      // -4.6 -> rounded to -5
      const f3 = new Fraction('-4.6');
      expect(f3.round().valueOf()).toBe(-5);
    });

    test('returns same integer for whole numbers', () => {
      const f = new Fraction(10);
      const rounded = f.round();
      expect(rounded.valueOf()).toBe(10);
      expect(rounded.n).toBe(10);
      expect(rounded.d).toBe(1);
    });
  });

  describe('specified decimal places', () => {
    test('rounds to 1 decimal place', () => {
      // 4.(3) = 4.3333... -> rounded to 1 place = 4.3 (43/10)
      const f = new Fraction('4.(3)');
      const rounded = f.round(1);
      expect(rounded.valueOf()).toBe(4.3);
      expect(rounded.n).toBe(43);
      expect(rounded.d).toBe(10);
    });

    test('rounds to 2 decimal places', () => {
      // 4.336 -> 4.34 (217/50)
      const f = new Fraction('4.336');
      const rounded = f.round(2);
      expect(rounded.valueOf()).toBe(4.34);
    });

    test('rounds to 3 decimal places', () => {
      // 1/3 = 0.3333... -> 0.333 (333/1000)
      const f = new Fraction(1, 3);
      const rounded = f.round(3);
      expect(rounded.valueOf()).toBe(0.333);
      expect(rounded.n).toBe(333);
      expect(rounded.d).toBe(1000);
    });
  });

  describe('edge cases and special values', () => {
    test('handles zero', () => {
      const f = new Fraction(0);
      const rounded = f.round();
      expect(rounded.valueOf()).toBe(0);
      expect(rounded.n).toBe(0);
      expect(rounded.d).toBe(1);
    });

    test('handles NaN fraction', () => {
      const f = new Fraction(NaN);
      const rounded = f.round();
      expect(isNaN(rounded.valueOf())).toBe(true);
      expect(isNaN(rounded.n)).toBe(true);
      expect(isNaN(rounded.d)).toBe(true);
    });
  });
});
