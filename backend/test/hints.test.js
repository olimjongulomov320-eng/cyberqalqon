/**
 * Level-2 hint derivation — the promise is what it does NOT return.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { realRightId } = require('../lib/grade');
const { hintLevel2 } = require('../lib/hints');

const mc = {
  id: 'e1',
  type: 'mc',
  q: { uz: 'savol', ru: 'вопрос' },
  options: [
    { id: 'a', uz: 'A', ru: 'A' },
    { id: 'b', uz: 'B', ru: 'B' },
    { id: 'c', uz: 'C', ru: 'C' },
    { id: 'd', uz: 'D', ru: 'D' },
  ],
  answer: 'c',
  explain: { uz: 'izoh', ru: 'пояснение' },
};

const tf = { id: 'e2', type: 'tf', answer: 'true', q: { uz: 's', ru: 'с' }, explain: { uz: 'i', ru: 'и' } };

const multi = {
  id: 'e3',
  type: 'multi',
  options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
  answers: ['a', 'c'],
  q: { uz: 's', ru: 'с' },
  explain: { uz: 'i', ru: 'и' },
};

const order = {
  id: 'e4',
  type: 'order',
  items: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }, { id: 'i4' }],
  order: ['i3', 'i1', 'i4', 'i2'],
  q: { uz: 's', ru: 'с' },
  explain: { uz: 'i', ru: 'и' },
};

const match = {
  id: 'e5',
  type: 'match',
  pairs: [
    { id: 'p1', left: { uz: 'l1', ru: 'l1' }, right: { uz: 'r1', ru: 'r1' } },
    { id: 'p2', left: { uz: 'l2', ru: 'l2' }, right: { uz: 'r2', ru: 'r2' } },
    { id: 'p3', left: { uz: 'l3', ru: 'l3' }, right: { uz: 'r3', ru: 'r3' } },
  ],
  match_answer: { p1: 'r2', p2: 'r3', p3: 'r1' },
  q: { uz: 's', ru: 'с' },
  explain: { uz: 'i', ru: 'и' },
};

const input = {
  id: 'e6',
  type: 'input',
  answer: 'ip address',
  accepted: ['ip adr'],
  q: { uz: 's', ru: 'с' },
  explain: { uz: 'i', ru: 'и' },
};

test('mc hint eliminates exactly one wrong option, never the answer', () => {
  const h = hintLevel2(mc);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'eliminate');
  assert.equal(h.ids.length, 1);
  assert.ok(mc.options.some(o => o.id === h.ids[0]), 'id must be a real option');
  assert.notEqual(h.ids[0], mc.answer);
});

test('mc with two options is never available (elimination would be the answer)', () => {
  const two = { ...mc, options: [{ id: 'a' }, { id: 'b' }], answer: 'a' };
  assert.deepEqual(hintLevel2(two), { available: false });
});

test('multi hint exposes the selection count only, never which options', () => {
  const h = hintLevel2(multi);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'count');
  assert.equal(h.count, 2);
  assert.equal(h.ids, undefined);
  assert.equal(h.answers, undefined);
});

test('multi where every option is correct gives nothing away', () => {
  const all = { ...multi, answers: ['a', 'b', 'c', 'd'] };
  assert.deepEqual(hintLevel2(all), { available: false });
});

test('order hint names the first step only', () => {
  const h = hintLevel2(order);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'first');
  assert.equal(h.id, order.order[0]);
  // The rest of the sequence must not leak.
  assert.equal(h.order, undefined);
  assert.equal(JSON.stringify(h).includes(order.order[1]), false);
});

test('order with fewer than three steps is unavailable', () => {
  const small = { ...order, items: [{ id: 'i1' }, { id: 'i2' }], order: ['i2', 'i1'] };
  assert.deepEqual(hintLevel2(small), { available: false });
});

const matchWithRightIds = {
  id: 'e5b',
  type: 'match',
  pairs: [
    { id: 'p1', left: { uz: 'L1', ru: 'L1' }, right: { id: 'p1', uz: 'R1', ru: 'R1' } },
    { id: 'p2', left: { uz: 'L2', ru: 'L2' }, right: { id: 'p2', uz: 'R2', ru: 'R2' } },
    { id: 'p3', left: { uz: 'L3', ru: 'L3' }, right: { id: 'p3', uz: 'R3', ru: 'R3' } },
  ],
  match_answer: { p1: 'p1', p2: 'p3', p3: 'p2' },
  q: { uz: 's', ru: 'с' },
  explain: { uz: 'i', ru: 'и' },
};

test('match hint reveals one valid pair only', () => {
  // Uses the published shape (right ids are pair ids); see lib/grade.js matchShift.
  const h = hintLevel2(matchWithRightIds);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'pair');
  assert.equal(h.left_id, 'p1');
  assert.equal(realRightId(matchWithRightIds, h.right_id), matchWithRightIds.match_answer.p1);
  assert.equal(JSON.stringify(h).includes('p2'), false);
});

test('match hint names the client-visible id of one correct pair', () => {
  // Right-hand texts reach the client under remapped ids (lib/grade.js), so the
  // hint's right_id must resolve back to the true match for left_id, and the
  // payload must not name any other pair's right text.
  const h = hintLevel2(matchWithRightIds);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'pair');
  assert.equal(h.left_id, 'p1');
  assert.equal(realRightId(matchWithRightIds, h.right_id), matchWithRightIds.match_answer.p1);
  assert.equal(JSON.stringify(h).includes('R2'), false);
  assert.equal(JSON.stringify(h).includes('R3'), false);
});

test('match hint still resolves to the true pair when some answers differ', () => {
  const ex = { ...matchWithRightIds, match_answer: { p1: 'p1', p2: 'p3' } };
  const h = hintLevel2(ex);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'pair');
  assert.equal(h.left_id, 'p1');
  assert.equal(realRightId(ex, h.right_id), 'p1');
});

test('input hint returns shape, never the words themselves', () => {
  const h = hintLevel2(input);
  assert.equal(h.available, true);
  assert.equal(h.kind, 'shape');
  assert.equal(h.words, 2);
  assert.equal(h.length, 'medium');
  assert.equal(JSON.stringify(h).toLowerCase().includes('ip'), false);
});

test('tf is never available', () => {
  assert.deepEqual(hintLevel2(tf), { available: false });
});

test('malformed or unknown exercises degrade to unavailable', () => {
  assert.deepEqual(hintLevel2(null), { available: false });
  assert.deepEqual(hintLevel2({ id: 'x', type: 'nope' }), { available: false });
  assert.deepEqual(hintLevel2({ id: 'x', type: 'order' }), { available: false });
  assert.deepEqual(hintLevel2({ id: 'x', type: 'input' }), { available: false });
});
