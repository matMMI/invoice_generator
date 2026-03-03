import { MICRO_CEILING, VAT_THRESHOLD, URSSAF_RATE } from "@/lib/fiscal";

describe("Fiscal constants", () => {
  it("MICRO_CEILING should be 77700€", () => {
    expect(MICRO_CEILING).toBe(77_700);
  });

  it("VAT_THRESHOLD should be 37500€", () => {
    expect(VAT_THRESHOLD).toBe(37_500);
  });

  it("URSSAF_RATE should be 25.6% (BNC 2026)", () => {
    expect(URSSAF_RATE).toBe(0.256);
  });

  it("VAT_THRESHOLD should be less than MICRO_CEILING", () => {
    expect(VAT_THRESHOLD).toBeLessThan(MICRO_CEILING);
  });
});
