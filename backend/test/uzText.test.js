const { test } = require('node:test');
const assert = require('node:assert/strict');
const { foldUz, searchKey } = require('../lib/uzText');
const { grade } = require('../lib/grade');

test('every apostrophe a keyboard can produce folds to the same letter', () => {
  const variants = ["o'zbek", 'o`zbek', 'o´zbek', 'o‘zbek', 'o’zbek', 'oʻzbek', 'oʼzbek', 'O‘ZBEK'];
  for (const v of variants) assert.equal(foldUz(v), 'özbek', v);
});

test('old digraphs and the new letters are the same text', () => {
  assert.equal(foldUz('shifrlash'), foldUz('şifrlaş'));
  assert.equal(foldUz('Chiqish'), foldUz('Çiqiş'));
  assert.equal(foldUz("tog'ri"), foldUz('toğri'));
  assert.equal(foldUz("O'ZBEKISTON"), foldUz('Özbekiston'));
});

test('decomposed input (letter + combining mark) matches the precomposed letter', () => {
  assert.equal(foldUz('ö'), 'ö');
  assert.equal(foldUz('ş'), 'ş');
});

test('the tutuq sign is kept for comparing and dropped for searching', () => {
  assert.equal(foldUz("ma'no"), foldUz('maʼno'));
  assert.notEqual(foldUz("ma'no"), foldUz('mano'));
  assert.equal(searchKey("ma'no"), searchKey('mano'));
});

test('non-Uzbek text and non-strings are safe', () => {
  assert.equal(foldUz(undefined), '');
  assert.equal(foldUz(null), '');
  assert.equal(foldUz(42), '42');
  assert.equal(foldUz('Cyber Attack'), 'cyber attack');
  assert.equal(foldUz('доступность'), 'доступность');
});

test('typed answers are graded the same whichever apostrophe or spelling is typed', () => {
  const ex = { type: 'input', answer: 'oʻzgartirish', accepted: ['şifrlaş'] };
  for (const typed of ["o'zgartirish", 'o‘zgartirish', 'oʻzgartirish', 'özgartiriş', ' O`ZGARTIRISH. ']) {
    assert.equal(grade(ex, typed), true, typed);
  }
  assert.equal(grade(ex, 'shifrlash'), true); // accepted alias, old spelling
  assert.equal(grade(ex, 'ozgartirish'), false); // missing the oʻ letter is still wrong
});
