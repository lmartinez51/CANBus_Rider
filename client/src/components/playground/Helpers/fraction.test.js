import Fraction from './fraction';

describe('Fraction.prototype.mul', () => {
  describe('basic multiplication', () => {
    it('multiplies two basic fractions correctly', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul(3, 4);
      expect(result.n).toBe(3);
      expect(result.d).toBe(8);
      expect(result.s).toBe(1);
      expect(result.toFraction()).toBe('3/8');
      expect(result.valueOf()).toBe(0.375);
    });

    it('simplifies the resulting fraction using GCD reduction', () => {
      const f1 = new Fraction(2, 3);
      const result = f1.mul(3, 4);
      expect(result.n).toBe(1);
      expect(result.d).toBe(2);
      expect(result.s).toBe(1);
      expect(result.toFraction()).toBe('1/2');
    });

    it('multiplies a fraction by an integer', () => {
      const f1 = new Fraction(3, 4);
      const result = f1.mul(2);
      expect(result.n).toBe(3);
      expect(result.d).toBe(2);
      expect(result.s).toBe(1);
      expect(result.toFraction()).toBe('3/2');
    });

    it('multiplies repeating decimals correctly as described in docstring example', () => {
      // Ex: new Fraction("-17.(345)").mul(3) => -5776 / 111
      const f1 = new Fraction('-17.(345)');
      const result = f1.mul(3);
      expect(result.s).toBe(-1);
      expect(result.n).toBe(5776);
      expect(result.d).toBe(111);
      expect(result.toFraction()).toBe('-5776/111');
    });
  });

  describe('signs and negative values', () => {
    it('handles positive multiplied by negative fraction', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul(-3, 4);
      expect(result.s).toBe(-1);
      expect(result.n).toBe(3);
      expect(result.d).toBe(8);
      expect(result.toFraction()).toBe('-3/8');
    });

    it('handles negative multiplied by positive fraction', () => {
      const f1 = new Fraction(-1, 2);
      const result = f1.mul(3, 4);
      expect(result.s).toBe(-1);
      expect(result.n).toBe(3);
      expect(result.d).toBe(8);
      expect(result.toFraction()).toBe('-3/8');
    });

    it('handles negative multiplied by negative fraction', () => {
      const f1 = new Fraction(-1, 2);
      const result = f1.mul(-3, 4);
      expect(result.s).toBe(1);
      expect(result.n).toBe(3);
      expect(result.d).toBe(8);
      expect(result.toFraction()).toBe('3/8');
    });
  });

  describe('zero multiplication', () => {
    it('multiplies fraction by zero', () => {
      const f1 = new Fraction(3, 4);
      const result = f1.mul(0);
      expect(result.n).toBe(0);
      expect(result.d).toBe(1);
      expect(result.s).toBe(1);
      expect(result.toFraction()).toBe('0');
      expect(result.valueOf()).toBe(0);
    });

    it('multiplies zero fraction by a fraction', () => {
      const f1 = new Fraction(0);
      const result = f1.mul(3, 4);
      expect(result.n).toBe(0);
      expect(result.d).toBe(1);
      expect(result.s).toBe(1);
      expect(result.toFraction()).toBe('0');
    });
  });

  describe('various parameter input formats', () => {
    it('accepts two arguments (numerator, denominator)', () => {
      const f1 = new Fraction(1, 3);
      const result = f1.mul(3, 5);
      expect(result.toFraction()).toBe('1/5');
    });

    it('accepts a fraction string "3/4"', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul('3/4');
      expect(result.toFraction()).toBe('3/8');
    });

    it('accepts a string representation with ratio colon "3:4"', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul('3:4');
      expect(result.toFraction()).toBe('3/8');
    });

    it('accepts a decimal string "0.25"', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul('0.25');
      expect(result.toFraction()).toBe('1/8');
    });

    it('accepts a repeating decimal string "0.(3)"', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul('0.(3)');
      expect(result.toFraction()).toBe('1/6');
    });

    it('accepts a mixed fraction string "1 1/2"', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul('1 1/2');
      expect(result.toFraction()).toBe('3/4');
    });

    it('accepts an object representation {n, d}', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul({ n: 3, d: 4 });
      expect(result.toFraction()).toBe('3/8');
    });

    it('accepts an object representation with sign {n, d, s}', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul({ n: 3, d: 4, s: -1 });
      expect(result.toFraction()).toBe('-3/8');
    });

    it('accepts an array representation [n, d]', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul([3, 4]);
      expect(result.toFraction()).toBe('3/8');
    });

    it('accepts another Fraction instance', () => {
      const f1 = new Fraction(1, 2);
      const f2 = new Fraction(3, 4);
      const result = f1.mul(f2);
      expect(result.toFraction()).toBe('3/8');
    });
  });

  describe('immutability and chaining', () => {
    it('does not mutate the original fraction object', () => {
      const f1 = new Fraction(1, 2);
      const result = f1.mul(3, 4);
      expect(f1.n).toBe(1);
      expect(f1.d).toBe(2);
      expect(f1.s).toBe(1);
      expect(f1.toFraction()).toBe('1/2');
      expect(result).not.toBe(f1);
    });

    it('supports method chaining', () => {
      const result = new Fraction(1, 2).mul(2, 3).mul(3, 4);
      expect(result.toFraction()).toBe('1/4');
    });
  });

  describe('error handling and edge cases', () => {
    it('throws DivisionByZero when multiplying by zero denominator (a, 0)', () => {
      const f1 = new Fraction(1, 2);
      expect(() => f1.mul(1, 0)).toThrow('Division by Zero');
    });

    it('throws NonIntegerParameter when non-integer values are passed as (a, b)', () => {
      const f1 = new Fraction(1, 2);
      expect(() => f1.mul(1.5, 2)).toThrow('Parameters must be integer');
    });

    it('throws InvalidParameter when an invalid argument is provided', () => {
      const f1 = new Fraction(1, 2);
      expect(() => f1.mul('invalid_string')).toThrow('Invalid argument');
    });
  });
});
