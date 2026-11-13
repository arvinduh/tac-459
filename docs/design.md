# Design system

The site sells a course to prospective students, so it should read like a calm,
confident editorial page. Every visual choice below has one job; if a new
element does not fit a role here, change this file first, then the code.

All raw values live in `src/styles/tokens.css`. Components use the semantic
tokens (`--color-brand`, `--text-lg`, …), never hex codes or pixel sizes.

## Color

Warm ink on paper carries the content. USC Cardinal and Gold carry the identity
in a few deliberate places, so they stay meaningful.

| Color           | Role                                                                                  | Never                       |
| --------------- | ------------------------------------------------------------------------------------- | --------------------------- |
| Ink on paper    | All reading text, in three strengths: text, muted, subtle                             |                             |
| Cardinal `#900` | Brand and action: header line, wordmark, links, and whatever is hovered, open or here | Page or section backgrounds |
| Gold `#fc0`     | The capstone's lane and selection                                                     | Text (1.5:1 on paper)       |

Cardinal means "you can act on this, or you are on it": a semester bar turns
Cardinal when hovered or open, a product name or a headline phrase when pointed
at. Every page is paper; there are no colored bands. Large fields of Cardinal or
Gold read as loud, so neither fills more than a thin bar.

Contrast on paper: text 16.8:1, muted 6.4:1, subtle 4.6:1 (the floor for any
text), Cardinal 8.5:1.

## Type

Two families, each with a meaning. A third would need a role neither covers.

| Family     | Means           | Used for                                                                  |
| ---------- | --------------- | ------------------------------------------------------------------------- |
| Geist      | The voice       | Everything people read: headings, prose, labels, names                    |
| Geist Mono | Data to look up | Course code, numerals, week and term labels, times and places, menu notes |

Mono never carries a sentence. In markup, data text takes the `data` class
(subtle) or `numeral` (for things that mark order).

A serif was tried and dropped: on this site it had no job Geist did not already
do. It earns a place only for a new role, such as quoting students.

**Weights.** 600 for headings and names, the things that title a block or open a
page. 500 for labels and links that lead onward. 400 for everything else. Bold
inside prose (`strong`) is 600. Nothing uses 700.

**Italic.** Not used. Emphasis comes from weight, and Geist's italic is not
loaded.

**Sizes.** One scale in `tokens.css`, largest first:

| Token            | Used for                                |
| ---------------- | --------------------------------------- |
| `--text-display` | The home headline only                  |
| `--text-title`   | Every other page's title (its one `h1`) |
| `--text-xl`      | Section headings (`h2`)                 |
| `--text-lg`      | Item titles (`h3`), names, ledes        |
| `--text-base`    | Body text                               |
| `--text-sm`      | Secondary text                          |
| `--text-xs`      | Data (mono)                             |

**Headings.** One `h1` per page. Each section opens with an `h2` at `--text-xl`,
directly above its content. Items inside a section are `h3`. Large type gets
tighter tracking (`--tracking-display`, `--tracking-heading`).

## Calls to action

There are no buttons. Every link that leads onward is a Cardinal `arrow-link`:
on hover an underline draws in from the left and the arrow grows a shaft and
slides forward.

## Layout

One content width (`--content-max`), one gutter, and one left edge: a section is
a hairline, its heading, then its content, so a heading always lines up with
what it introduces. Nothing is centered.

The site has two levels of detail and no more: pages, and cards that open in
place. A thing gets its own page only when it has more to say than a card holds
(a person, a product); everything else opens where it is mentioned.

**Home** is a poster. The course name and the blurb with the term's facts
(linked to the USC Schedule of Classes, the map and Google Calendar) hold the
top corners in small type; the headline fills the floor of the first screen,
sized to the width (three quarters for type, the rest for arcs) and capped by
the screen's height. On phones it is sized by its longest word and lines wrap,
so it still fills the page. Each line has one key term, marked in `*asterisks*`
in the content. Self-attention is drawn beside it: arcs curve out from each
line's end, clear of every line they pass, into the lines it attends to, all
resting in a faint rule color. The lines take turns being read, top to bottom;
the reading line's key term and arcs turn Cardinal. Pointing at a line reads it
and holds the turns, which also stop off screen, in a hidden tab and under
reduced motion. The semester line and the people teaching follow. No student
product appears: the course is the subject.

**Course** opens on the semester line, generated from the course files: a column
per week, a lane per part, a bar for every module and step, in the part's color
(ink for the curriculum, light ink for the company overview, Gold for the
capstone). Every bar opens its card. Each part follows as a section with a
sticky heading, anchored by its id so `/course/#capstone` links straight to it;
the capstone ends with three products past teams shipped.

**Projects** is a typographic index, newest term first: names set large, each a
plain link. On wide screens a sticky frame beside the list shows the cover of
whichever row the pointer or keyboard is on; phones show a small cover per row.

The header is a solid bar that sticks to the top: inline links on wide screens,
a full-screen sheet on phones. Nothing blurs; a blur costs a filter pass every
scrolled frame and muddies the text behind it. The footer is one line naming the
course and its school; the header alone carries navigation. Scrollbars are thin
and quiet but never hidden: on a mouse-driven desktop they show where you are.
Only a block that is wider than the phone, such as the staff timeline, scrolls
sideways; the page itself never does.

Portraits are grayscale in lists, so photos from different cameras read as one
set, and fade to color on hover in step with the name's underline; on a person's
own page they are in color. A person's page names their roles and terms in mono,
since both are data drawn from the term files. Class photos and screenshots link
to their full-size file, with a zoom cursor as the only cue.

## Interactions

Floating UI lives in `packages/interact`, so pages only mark triggers:

- `data-card="<id>"` opens the page's `<template id="card-<id>">` as a card.
  With a mouse it opens after a short pause and stays open while the pointer
  moves onto it; focus opens it at once. On touch the first tap opens it as a
  sheet from the bottom and a second tap follows the link.
- `data-tip="<text>"` shows one short line on hover or focus. A hint repeats
  what the page already says, so touch goes without.

Both are single shared native popovers: top layer, light dismiss and Escape for
free. Card contents use the global classes in `src/styles/cards.css`.

## Motion

Short and quiet, and only opacity, transform or stroke offsets, so it stays
smooth on phones. Entrances spring (`--ease-spring`, a CSS `linear()` curve,
over `--duration-enter`); exits are faster and plain (`--ease-exit`). Content
rises in on load and between pages; rows marked `reveal` rise in as they scroll
into view; timeline bars draw in from their first term. The home headline's arcs
draw in, strongest first, for whichever word is active; a script lays them out
only on load and resize. Nothing loops, so nothing runs while the page is still.
Durations come from tokens, and reduced-motion settings collapse them all to an
instant.

Scroll-driven rules use longhand properties: the CSS minifier folds `animation`
and `animation-timeline` into one shorthand that browsers reject.
