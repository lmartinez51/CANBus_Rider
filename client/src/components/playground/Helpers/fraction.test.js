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

  describe('div', () => {
    test('divides two rational numbers correctly', () => {
      const f1 = new Fraction(3, 4);
      const res = f1.div(1, 2);
      expect(res.n).toBe(3);
      expect(res.d).toBe(2);
      expect(res.toString()).toBe('1.5');
    });

    test('divides by negative fraction correctly', () => {
      const f1 = new Fraction(3, 4);
      const res = f1.div(new Fraction(-1, 2));
      expect(res.s).toBe(-1);
      expect(res.n).toBe(3);
      expect(res.d).toBe(2);
    });

    test('throws error on division by zero number', () => {
      const f = new Fraction(1, 2);
      expect(() => f.div(0)).toThrow('Division by Zero');
    });

    test('throws error on division by zero Fraction object', () => {
      const f = new Fraction(3, 4);
      const zeroFrac = new Fraction(0);
      expect(() => f.div(zeroFrac)).toThrow('Division by Zero');
    });

    test('throws error on division by zero string', () => {
      const f = new Fraction(1, 2);
      expect(() => f.div('0')).toThrow('Division by Zero');
    });

    test('throws error on division by two arguments representing zero', () => {
      const f = new Fraction(1, 2);
      expect(() => f.div(0, 1)).toThrow('Division by Zero');
    });
  });
});
