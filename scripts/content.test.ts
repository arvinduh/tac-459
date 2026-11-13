/** Unit tests for the content script helpers. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { slugify } from './content.ts';

test('slugify makes ascii kebab-case ids', () => {
  assert.equal(slugify('Jane Doe'), 'jane-doe');
  assert.equal(slugify('  José  Núñez '), 'jose-nunez');
  assert.equal(slugify('IMG_1234 2'), 'img-1234-2');
});
