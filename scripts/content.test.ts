/** Unit tests for the content script helpers. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rewriteReference, slugify } from './content.ts';

test('slugify makes ascii kebab-case ids', () => {
  assert.equal(slugify('Jane Doe'), 'jane-doe');
  assert.equal(slugify('  José  Núñez '), 'jose-nunez');
  assert.equal(slugify('IMG_1234 2'), 'img-1234-2');
});

test('rewriteReference updates plain, quoted and listed paths', () => {
  const text = [
    'photo: ./IMG 1.JPG',
    "classPhoto: './IMG 1.JPG'",
    'images: [./IMG 1.JPG, ./2.png]',
    'other: ./IMG 1.JPG.bak',
  ].join('\n');
  assert.equal(
    rewriteReference(text, 'IMG 1.JPG', 'img-1.webp'),
    [
      'photo: ./img-1.webp',
      "classPhoto: './img-1.webp'",
      'images: [./img-1.webp, ./2.png]',
      'other: ./IMG 1.JPG.bak',
    ].join('\n'),
  );
});
