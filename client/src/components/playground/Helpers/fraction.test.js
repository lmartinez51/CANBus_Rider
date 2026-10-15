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
});
