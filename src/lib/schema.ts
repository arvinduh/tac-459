/**
 * Builders for schema.org JSON-LD, the structured data search engines read.
 *
 * Pure functions over plain values, so they are unit tested without Astro;
 * pages gather the values and the layout prints the result.
 */

const CONTEXT = 'https://schema.org';

/** A person as name plus the page about them. */
interface PersonRef {
  name: string;
  url: string;
}

interface CourseInput {
  name: string;
  courseCode: string;
  description: string;
  url: string;
  /** Label of the term on offer, e.g. 'Fall 2026'. */
  term: string;
  location?: string;
  instructors: PersonRef[];
}

/** Describes the course and its current offering, taught on site at USC. */
export function courseSchema(input: CourseInput) {
  const instructors = input.instructors.map((person) => ({
    '@type': 'Person',
    ...person,
  }));
  return {
    '@context': CONTEXT,
    '@type': 'Course',
    name: input.name,
    courseCode: input.courseCode,
    description: input.description,
    url: input.url,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Southern California',
      url: 'https://www.usc.edu/',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      name: input.term,
      courseMode: 'Onsite',
      ...(input.location && { location: input.location }),
      instructor: instructors,
    },
  };
}

interface PersonInput extends PersonRef {
  jobTitle: string[];
  image: string;
  /** Profiles elsewhere, such as LinkedIn. */
  sameAs: string[];
}

/** Describes one member of the teaching team. */
export function personSchema(input: PersonInput) {
  return {
    '@context': CONTEXT,
    '@type': 'Person',
    name: input.name,
    url: input.url,
    image: input.image,
    jobTitle: input.jobTitle,
    ...(input.sameAs.length > 0 && { sameAs: input.sameAs }),
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'University of Southern California',
    },
  };
}

/** Describes the trail from the home page to this one, in order. */
export function breadcrumbSchema(trail: PersonRef[]) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: url,
    })),
  };
}
