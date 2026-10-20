# TAC 459 course site

The website for TAC 459, Generative AI and Natural Language Processing, the
capstone of the USC AI Minor. Built with [Astro](https://astro.build) as a
static site.

## Where content lives

Everything a course staff member edits is under `src/content/`, and every file
is validated at build time. A typo or a missing person fails the build with the
file and field name.

| File                                           | Holds                                                  |
| ---------------------------------------------- | ------------------------------------------------------ |
| `site.yaml`                                    | Course name and current term                           |
| `course/overview.yaml`                         | The pitch and the three components, with their steps   |
| `course/curriculum.yaml`                       | Modules and weekly topics                              |
| `terms/<term>.yaml` and class photo            | One term: label, meeting times, staff, class photo     |
| `people/<id>/index.md` and photo               | One person's roles, links and bio                      |
| `projects/<term>/<product>/index.md` and shots | One past product: summary, team, write-up, screenshots |

## Starting a new term

1. Copy the latest `src/content/terms/<term>.yaml` to the new term's name and
   update its meeting times and staff.
2. Add a folder under `src/content/people/` for anyone new.
3. Point `currentTerm` in `src/content/site.yaml` at the new file.

Old term files and people stay in place; past staff keep their pages.

After the term ends, add a folder per product under
`src/content/projects/<term>/` and the class photo beside the term file. Keep
images under about 2400px wide; the build makes every smaller size.

## Commands

Requires Node 22.22 or later.

| Command          | Does                                     |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Serves the site locally with live reload |
| `npm run check`  | Checks formatting, types and content     |
| `npm test`       | Runs the unit tests                      |
| `npm run build`  | Builds the static site into `dist/`      |
| `npm run format` | Formats every file                       |

Every push and pull request runs check, test and build. Pushes to `main` deploy
to GitHub Pages.
