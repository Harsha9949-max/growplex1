// margin-calculator.test.ts
describe('Margin Calculator', () => {
  it('correctly calculates 25% margin', () => {
    const base = 100;
    const margin = 25;
    expect(base * (1 + margin / 100)).toBe(125);
  });
});
