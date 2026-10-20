import { describe, expect, it } from 'vitest';
import { capsuleUnlocked, COUPONS, couponWhatsAppUrl, rapidCrestTaps, scratchRevealed } from './journalSurprises';
describe('journal surprise rules', () => {
  it('reveals the foil only when at least 60 percent is cleared', () => {
    expect(scratchRevealed(59, 100)).toBe(false);
    expect(scratchRevealed(60, 100)).toBe(true);
    expect(scratchRevealed(0, 0)).toBe(false);
  });
  it('keeps the capsule sealed until November 4 2027 in India', () => {
    expect(capsuleUnlocked(Date.parse('2027-11-03T23:59:59+05:30'))).toBe(false);
    expect(capsuleUnlocked(Date.parse('2027-11-04T00:00:00+05:30'))).toBe(true);
  });
  it('makes a direct WhatsApp redemption for each of the four coupons', () => {
    expect(COUPONS).toHaveLength(4);
    for (const name of COUPONS) {
      const url = new URL(couponWhatsAppUrl('919342073364', name));
      expect(url.pathname).toBe('/919342073364');
      expect(url.searchParams.get('text')).toBe(`I just redeemed my coupon for: ${name}! ❤️`);
    }
  });
  it('requires three crest taps within 900ms', () => {
    expect(rapidCrestTaps([100, 400], 800)).toHaveLength(3);
    expect(rapidCrestTaps([100, 400], 1100)).toHaveLength(2);
  });
});