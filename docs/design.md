# Design system

The site sells a course to prospective students, so it should read like a calm,
confident editorial page. Every visual choice below has one job; if a new
element does not fit a role here, change this file first, then the code.

All raw values live in `src/styles/tokens.css`. Components use the semantic
tokens (`--color-brand`, `--text-lg`, …), never hex codes or pixel sizes.

## Color

Warm ink on paper carries the content. USC Cardinal and Gold carry the identity
in a few deliberate places, so they stay meaningful.

| Color           | Role                                                                              | Never                       |
| --------------- | --------------------------------------------------------------------------------- | --------------------------- |
| Ink on paper    | All reading text, in three strengths: text, muted, subtle                         |                             |
| Cardinal `#900` | Brand and action: wordmark, links, eyebrows, numerals, menu dot, instructor bars  | Page or section backgrounds |
| Gold `#fc0`     | Highlight: current-page dot, hover underlines, selection, learning assistant bars | Text (1.5:1 on paper)       |

Contrast on paper: text 16.8:1, muted 6.4:1, subtle 4.6:1 (the floor for any
text), Cardinal 8.5:1.

## Type

Two families, each with a meaning. A third would need a role neither covers.

| Family         | Means           | Used for                                                                  |
| -------------- | --------------- | ------------------------------------------------------------------------- |
| Inter          | The voice       | Everything people read: headings, prose, labels, names                    |
| JetBrains Mono | Data to look up | Course code, numerals, week and term labels, times and places, menu notes |

Mono never carries a sentence. In markup, data text takes the `data` class
(subtle) or `numeral` (Cardinal, for things that mark order).

A serif was tried and dropped: on this site it had no job Inter did not already
do. It earns a place only for a new role, such as quoting students.

**Weights.** 600 for headings and names, the things that title a block or open a
page. 500 for labels, eyebrows and links that act like buttons. 400 for
everything else. Bold inside prose (`strong`) is 600. Nothing uses 700.

**Italic.** Not used. Emphasis comes from weight, and Inter's italic is not
loaded.

**Sizes.** One scale in `tokens.css`, largest first:

| Token            | Used for                                 |
| ---------------- | ---------------------------------------- |
| `--text-display` | The home page title only                 |
| `--text-title`   | Every other page's title (its one `h1`)  |
| `--text-xl`      | A section's opening statement            |
| `--text-lg`      | Item titles (`h3`), names, ledes         |
| `--text-base`    | Body text                                |
| `--text-sm`      | Secondary text, section labels, eyebrows |
| `--text-xs`      | Data (mono)                              |

**Headings.** One `h1` per page. Section labels are `h2` but set small at weight
500: they are signposts in the left column, not shouts. Items inside a section
are `h3`. Large type gets tighter tracking (`--tracking-display`,
`--tracking-heading`).

## Layout

One content width (`--content-max`), one gutter, and one editorial grid: a
section is a hairline, a label in the narrow left column, and content in the
wide right column. On phones the label stacks on top. Ordered rows lead with a
numeral (`numbered-row`).

## Motion

Short and quiet. Content rises in on load and between pages; the menu grows out
of its dot. Durations come from tokens, and reduced-motion settings collapse
them all to an instant.
