/** Unit tests for the JSON-LD builders. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { breadcrumbSchema, courseSchema, personSchema } from './schema.ts';

test('courseSchema nests instructors in the current offering', () => {
  const course = courseSchema({
    name: 'Generative AI',
    courseCode: 'TAC 459',
    description: 'A course.',
    url: 'https://example.edu/',
    term: 'Fall 2026',
    location: 'KAP 160',
    instructors: [{ name: 'Ada', url: 'https://example.edu/team/ada/' }],
  });
  assert.equal(course['@type'], 'Course');
  assert.equal(course.hasCourseInstance.location, 'KAP 160');
  assert.deepEqual(course.hasCourseInstance.instructor, [
    { '@type': 'Person', name: 'Ada', url: 'https://example.edu/team/ada/' },
  ]);
});

test('courseSchema omits an unknown location', () => {
  const course = courseSchema({
    name: 'Generative AI',
    courseCode: 'TAC 459',
    description: 'A course.',
    url: 'https://example.edu/',
    term: 'Fall 2026',
    instructors: [],
  });
  assert.equal('location' in course.hasCourseInstance, false);
});

test('personSchema omits sameAs when there are no profiles', () => {
  const person = personSchema({
    name: 'Ada',
    url: 'https://example.edu/team/ada/',
    image: 'https://example.edu/ada.webp',
    jobTitle: ['Instructor'],
    sameAs: [],
  });
  assert.equal('sameAs' in person, false);
  assert.deepEqual(person.jobTitle, ['Instructor']);
});

test('breadcrumbSchema numbers items from one', () => {
  const trail = breadcrumbSchema([
    { name: 'Home', url: 'https://example.edu/' },
    { name: 'Team', url: 'https://example.edu/team/' },
  ]);
  assert.deepEqual(
    trail.itemListElement.map(({ position, name }) => [position, name]),
    [
      [1, 'Home'],
      [2, 'Team'],
    ],
  );
});
