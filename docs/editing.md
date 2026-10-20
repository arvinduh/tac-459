# Editing the site

Everything on the site comes from files in `src/content/`. You never need to
touch code to update the course. Every file is checked when the site builds, so
a typo or a missing photo stops the build with the file and field name instead
of breaking the live site.

## Two ways to edit

**In the browser (no setup).** Open the repository on GitHub, find the file
under `src/content/`, and click the pencil to edit it, or use **Add file →
Upload files** inside the right folder to add a photo. Commit to `main`. The
**Actions** tab shows the build; a red cross means something needs fixing, and
its log names the file. Large or oddly named images still deploy, but the build
leaves a warning asking someone to run `npm run images` later.

**On your computer.** Install Node 22.22 or later, then:

```sh
npm install        # once, and again after pulling dependency changes
npm run dev        # preview at http://localhost:4321/tac-459/
npm run images     # shrink and rename any images you added
npm run check      # the same checks the build runs
```

## Common tasks

### Start a new term

```sh
npm run new -- term spring-2027
```

This copies the current term file to `src/content/terms/spring-2027.yaml`. The
file name is the term: the site names it "Spring 2027" and links its USC
Schedule of Classes page from it. In the new file, update:

| Field      | What                                                      |
| ---------- | --------------------------------------------------------- |
| `classes`  | First and last day of classes, `{ start: 2027-01-11, … }` |
| `noClass`  | Class days that are holidays, left out of the calendar    |
| `meetings` | Days, times and room; a room code such as `KAP 160` links |
| `staff`    | Who teaches, with any office hours                        |

Then set `currentTerm: spring-2027` in `src/content/site.yaml`. The build
refuses a current term whose class dates are missing or still last term's, or
that has no meetings or no instructor, and says which. A new room's building
goes under `buildings` in `site.yaml` once. Old term files stay: they feed the
team timeline and the projects page.

Every Monday a CI run checks the date; three weeks after the last class it fails
with these steps, so a forgotten rollover cannot sit unnoticed. Everything else
on the site (the calendar file, week numbers, the term name and links) is
generated from these fields.

### Add a person

```sh
npm run new -- person "Jane Doe"
```

This creates `src/content/people/jane-doe/index.md`. Fill in the template. Their
initials stand in for a portrait until you put a square photo in the same
folder, run `npm run images` and uncomment the `photo` line. Then add them to
the term file's `staff` list:

```yaml
staff:
  - { person: jane-doe, role: learningAssistant }
```

`role` is `instructor` or `learningAssistant`. A person's folder stays forever,
so past staff keep their pages and their place on the timeline.

### Post office hours

Add `officeHours` to that person's line in the term file. Leave it out when
hours are announced elsewhere.

```yaml
staff:
  - person: jane-doe
    role: learningAssistant
    officeHours:
      { days: [Thu], start: '15:00', end: '16:00', location: SAL 125 }
```

Times are 24-hour (`'15:00'`), in quotes. Days are `Mon` to `Fri`.

### Add last term's products

For each team:

```sh
npm run new -- project fall-2026 "Study Buddy AI"
```

This creates `src/content/projects/fall-2026/study-buddy-ai/index.yaml`. Add the
screenshots to that folder named `1`, `2`, `3` (the first is the cover), run
`npm run images`, and fill in the template. Demo, code and video links are
optional and appear only when present. Add the class photo next to the term file
(`src/content/terms/fall-2026.jpg`) and set `classPhoto: ./fall-2026.jpg` in the
term file before running `npm run images`.

### Change the course description or curriculum

| What                                                   | File                     |
| ------------------------------------------------------ | ------------------------ |
| Title and search description                           | `site.yaml`              |
| Home headline and blurb; each part's promise and weeks | `course/overview.yaml`   |
| Modules, weekly topics, deeper topics                  | `course/curriculum.yaml` |

## Which format, and why

- **YAML** (`.yaml`) holds records: fields with fixed meanings that the site
  lays out the same way every time (terms, products, the curriculum).
- **Markdown** (`.md`) holds prose that varies from person to person, so only
  people's bios use it. The fields at the top between `---` lines are YAML; the
  bio below them can use `## headings`, `- lists` and `**bold**`.

## Images

The build accepts JPEG, PNG and WebP and serves every size each page needs, so
any photo works. `npm run images` keeps the repository small: it converts images
to WebP at most 2400px wide, renames them to lowercase ids (so `IMG 2041.JPG`
becomes `img-2041.webp`) and updates the files that point at them.

## Where to look next

- `docs/design.md` explains the colors, type and layout rules.
- `README.md` lists every command.
