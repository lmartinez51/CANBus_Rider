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

  describe('mul', () => {
    test('multiplies fraction with single integer', () => {
      const f = new Fraction(2, 3);
      const res = f.mul(4);

      expect(res).toBeInstanceOf(Fraction);
      expect(res.s).toBe(1);
      expect(res.n).toBe(8);
      expect(res.d).toBe(3);
    });

    test('multiplies fraction with two integers (numerator and denominator)', () => {
      const f = new Fraction(2, 3);
      const res = f.mul(3, 4);

      expect(res).toBeInstanceOf(Fraction);
      expect(res.s).toBe(1);
      expect(res.n).toBe(1);
      expect(res.d).toBe(2);
    });

    test('multiplies fraction with another Fraction instance', () => {
      const f1 = new Fraction(2, 3);
      const f2 = new Fraction(3, 5);
      const res = f1.mul(f2);

      expect(res).toBeInstanceOf(Fraction);
      expect(res.s).toBe(1);
      expect(res.n).toBe(2);
      expect(res.d).toBe(5);
    });

    test('multiplies fraction with object representation {n, d}', () => {
      const f = new Fraction(2, 3);
      const res = f.mul({ n: 3, d: 5 });

      expect(res).toBeInstanceOf(Fraction);
      expect(res.s).toBe(1);
      expect(res.n).toBe(2);
      expect(res.d).toBe(5);
    });

    test('multiplies fraction with array representation [n, d]', () => {
      const f = new Fraction(2, 3);
      const res = f.mul([3, 5]);

      expect(res).toBeInstanceOf(Fraction);
      expect(res.s).toBe(1);
      expect(res.n).toBe(2);
      expect(res.d).toBe(5);
    });

    test('multiplies fraction with string fraction and repeating decimal string', () => {
      const f1 = new Fraction(1, 2);
      const res1 = f1.mul('3/4');
      expect(res1.n).toBe(3);
      expect(res1.d).toBe(8);

      const f2 = new Fraction('-17.(345)');
      const res2 = f2.mul(3);
      expect(res2.s).toBe(-1);
      expect(res2.n).toBe(5776);
      expect(res2.d).toBe(111);
      expect(res2.toFraction()).toBe('-5776/111');
    });

    test('handles signs correctly (positive, negative)', () => {
      const pos = new Fraction(2, 3);
      const neg = new Fraction(-2, 3);

      const posByNeg = pos.mul(-3, 4);
      expect(posByNeg.s).toBe(-1);
      expect(posByNeg.n).toBe(1);
      expect(posByNeg.d).toBe(2);

      const negByPos = neg.mul(3, 4);
      expect(negByPos.s).toBe(-1);
      expect(negByPos.n).toBe(1);
      expect(negByPos.d).toBe(2);

      const negByNeg = neg.mul(-3, 4);
      expect(negByNeg.s).toBe(1);
      expect(negByNeg.n).toBe(1);
      expect(negByNeg.d).toBe(2);
    });

    test('multiplies by zero correctly', () => {
      const f = new Fraction(5, 6);
      const res = f.mul(0);

      expect(res.n).toBe(0);
      expect(res.d).toBe(1);
      expect(res.s).toBe(1);
    });

    test('does not mutate original Fraction object', () => {
      const f = new Fraction(2, 3);
      f.mul(4, 5);

      expect(f.s).toBe(1);
      expect(f.n).toBe(2);
      expect(f.d).toBe(3);
    });

    test('throws error on division by zero in parameter', () => {
      const f = new Fraction(1, 2);
      expect(() => f.mul(1, 0)).toThrow('Division by Zero');
    });

    test('throws error on invalid parameter', () => {
      const f = new Fraction(1, 2);
      expect(() => f.mul('invalid_string')).toThrow('Invalid argument');
      expect(() => f.mul({})).toThrow('Invalid argument');
    });

    test('throws error on non-integer parameters when passing two numbers', () => {
      const f = new Fraction(1, 2);
      expect(() => f.mul(1.5, 2)).toThrow('Parameters must be integer');
    });
  });
});
