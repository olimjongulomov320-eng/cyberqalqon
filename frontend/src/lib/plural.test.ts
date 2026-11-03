import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questionCount, ruForm } from './plural.ts';

test('Russian picks the form by the number', () => {
  const f = ['вопрос', 'вопроса', 'вопросов'] as const;
  const cases: [number, string][] = [[1, 'вопрос'], [2, 'вопроса'], [4, 'вопроса'], [5, 'вопросов'], [11, 'вопросов'], [12, 'вопросов'], [21, 'вопрос'], [22, 'вопроса'], [111, 'вопросов'], [0, 'вопросов']];
  for (const [n, want] of cases) assert.equal(ruForm(n, f), want, String(n));
});

test('Uzbek keeps the singular after a number', () => {
  assert.equal(questionCount(4, 'uz'), '4 savol');
  assert.equal(questionCount(4, 'ru'), '4 вопроса');
  assert.equal(questionCount(5, 'ru'), '5 вопросов');
});
