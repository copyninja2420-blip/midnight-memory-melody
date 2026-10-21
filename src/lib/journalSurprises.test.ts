import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { capsuleUnlocked, COUPONS, couponWhatsAppUrl, rapidCrestTaps, scratchRevealed } from './journalSurprises';
describe('journal surprise rules', () => {
  it('reveals the foil only when at least 60 percent is cleared', () => {
    assert.equal(scratchRevealed(59, 100), false);
    assert.equal(scratchRevealed(60, 100), true);
    assert.equal(scratchRevealed(0, 0), false);
  });
  it('keeps the capsule sealed until November 4 2027 in India', () => {
    assert.equal(capsuleUnlocked(Date.parse('2027-11-03T23:59:59+05:30')), false);
    assert.equal(capsuleUnlocked(Date.parse('2027-11-04T00:00:00+05:30')), true);
  });
  it('makes a direct WhatsApp redemption for each of the four coupons', () => {
    assert.equal(COUPONS.length, 4);
    for (const name of COUPONS) {
      const url = new URL(couponWhatsAppUrl('919342073364', name));
      assert.equal(url.pathname, '/919342073364');
      assert.equal(url.searchParams.get('text'), `I just redeemed my coupon for: ${name}! ❤️`);
    }
  });
  it('requires three crest taps within 900ms', () => {
    assert.equal(rapidCrestTaps([100, 400], 800).length, 3);
    assert.equal(rapidCrestTaps([100, 400], 1100).length, 2);
  });
});