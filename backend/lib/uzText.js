/**
 * Uzbek Latin text folding, so what a learner types matches what the content
 * says whichever keyboard they use.
 *
 * Two things differ between keyboards and spellings:
 *  - the apostrophe: ' ` ´ ‘ ’ ʻ ʼ are all typed for oʻ, gʻ and the tutuq sign;
 *  - the letters: the 2026 reform writes ö ğ ş ç where today's alphabet writes
 *    oʻ gʻ sh ch.
 * `foldUz` maps both spellings to one form (the new letters), so "o'zbek",
 * "oʻzbek" and "özbek" are equal. It is lossy on purpose and only for
 * comparing and searching, never for display. Keep in step with
 * frontend/src/lib/uzText.ts (a test compares the two).
 */
const APOSTROPHES = /['`´‘’‛ʻʼʹ′‵]/g;

function foldUz(value) {
  return String(value ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(APOSTROPHES, "'")
    .replace(/([og])'/g, (_, c) => (c === 'o' ? 'ö' : 'ğ'))
    .replace(/sh/g, 'ş')
    .replace(/ch/g, 'ç');
}

/** For search: also ignore any remaining tutuq, so "maʼno" is found by "mano". */
function searchKey(value) {
  return foldUz(value).replace(/'/g, '');
}

module.exports = { foldUz, searchKey };
