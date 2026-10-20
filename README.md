# TAC 459 course site

The website for TAC 459, Generative AI and Natural Language Processing, the
capstone of the USC AI Minor. Built with [Astro](https://astro.build) as a
static site.

**Updating the course?** Read [docs/editing.md](docs/editing.md). Every update
is a content file under `src/content/`; no code changes needed.

| Folder or file               | Holds                                                |
| ---------------------------- | ---------------------------------------------------- |
| `site.yaml`                  | Course name, search description and current term     |
| `course/overview.yaml`       | The pitch and the three components, with their steps |
| `course/curriculum.yaml`     | Modules and weekly topics                            |
| `terms/<term>.yaml`          | One term: meetings, staff, office hours, class photo |
| `people/<id>/`               | One person's roles, links, photo and bio             |
| `projects/<term>/<product>/` | One past product: record and screenshots             |

[docs/design.md](docs/design.md) explains the colors, type and layout rules.

## Commands

Requires Node 22.22 or later.

| Command                   | Does                                             |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Serves the site locally with live reload         |
| `npm run new -- <kind> …` | Starts a person, project or term from a template |
| `npm run images`          | Shrinks, converts and renames content images     |
| `npm run check`           | Checks formatting, types and content             |
| `npm test`                | Runs the unit tests                              |
| `npm run build`           | Builds the static site into `dist/`              |
| `npm run format`          | Formats every file                               |

Every push and pull request runs check, test and build. Pushes to `main` deploy
to GitHub Pages.
