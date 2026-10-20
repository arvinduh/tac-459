# TAC 459 course site

The website for TAC 459, Generative AI and Natural Language Processing, the
capstone of the USC AI Minor. Built with [Astro](https://astro.build) as a
static site, with small scripts for the parts that depend on today's date.

## Where content lives

Everything a course staff member edits is under `src/content/`, and every file
is validated at build time. A typo, a bad date or a missing person fails the
build with the file and field name.

| File                             | Holds                                         |
| -------------------------------- | --------------------------------------------- |
| `site.yaml`                      | Course name, current term, time zone          |
| `course/curriculum.yaml`         | Modules and weekly topics, no dates           |
| `course/deliverables.yaml`       | Every graded item, by id                      |
| `terms/<term>.yaml`              | One term: start date, staff, hours, due dates |
| `people/<id>/index.md` and photo | One person's roles, links and bio             |

## Starting a new term

1. Copy the latest `src/content/terms/<term>.yaml` to the new term's name and
   update its dates, staff and office hours.
2. Add a folder under `src/content/people/` for anyone new.
3. Point `currentTerm` in `src/content/site.yaml` at the new file.

Old term files and people stay in place; past staff keep their pages.

## Commands

Requires Node 22.22 or later.

| Command          | Does                                     |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Serves the site locally with live reload |
| `npm run check`  | Checks formatting, types and content     |
| `npm test`       | Runs the date and time unit tests        |
| `npm run build`  | Builds the static site into `dist/`      |
| `npm run format` | Formats every file                       |

Every push and pull request runs check, test and build. Pushes to `main` deploy
to GitHub Pages.
