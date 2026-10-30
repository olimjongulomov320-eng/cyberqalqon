import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { foldUz, searchKey } from './uzText.ts';

const require = createRequire(import.meta.url);
const backend = require('../../../backend/lib/uzText') as typeof import('./uzText.ts');

test('the frontend and backend folds agree', () => {
  const samples = [
    "o'zbek", 'oʻzbek', 'Gʻalaba', "TO'G'RI", 'shifrlash', 'Şifrlaş', "ma'no", 'maʼno', 'chiqish',
    'доступность', 'Cyber Attack', "s'h", '', 'ö', 'ʻ', "o' g'",
  ];
  for (const s of samples) {
    assert.equal(foldUz(s), backend.foldUz(s), s);
    assert.equal(searchKey(s), backend.searchKey(s), s);
  }
});

test('search finds Uzbek titles whichever way the learner types them', () => {
  const title = "Parollar va ikki bosqichli tasdiqlash: oʻzgartirish";
  for (const q of ["o'zgar", 'özgar', 'o‘zgar', 'tasdiqlash', 'ikki bosqich']) {
    assert.ok(searchKey(title).includes(searchKey(q)), q);
  }
});
