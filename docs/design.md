# Design system

The site sells a course to prospective students, so it should read like a calm,
confident editorial page. Every visual choice below has one job; if a new
element does not fit a role here, change this file first, then the code.

All raw values live in `src/styles/tokens.css`. Components use the semantic
tokens (`--color-brand`, `--text-lg`, …), never hex codes or pixel sizes.

## Color

Warm ink on paper carries the content. USC Cardinal and Gold carry the identity
in a few deliberate places, so they stay meaningful.

| Color           | Role                                                                                                               | Never                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| Ink on paper    | All reading text, in three strengths: text, muted, subtle                                                          |                             |
| Cardinal `#900` | Brand and action: header line, wordmark, links, eyebrows, numerals, the story's model and outline, instructor edge | Page or section backgrounds |
| Gold `#fc0`     | Highlight: hover underlines on names and cards, selection, learning assistant edge                                 | Text (1.5:1 on paper)       |

A quiet surface (`--color-surface`) fills placeholders and timeline bars; color
goes on a bar's thin edge, and a warm tint of it marks people still teaching.
Large fields of Cardinal or Gold read as loud, so neither fills more than a thin
bar.

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
page. 500 for labels, eyebrows and links that lead onward. 400 for everything
else. Bold inside prose (`strong`) is 600. Nothing uses 700.

**Italic.** Not used. Emphasis comes from weight, and Inter's italic is not
loaded.

**Sizes.** One scale in `tokens.css`, largest first:

| Token            | Used for                                |
| ---------------- | --------------------------------------- |
| `--text-display` | The home headline only                  |
| `--text-title`   | Every other page's title (its one `h1`) |
| `--text-xl`      | Section headings (`h2`)                 |
| `--text-lg`      | Item titles (`h3`), names, ledes        |
| `--text-base`    | Body text                               |
| `--text-sm`      | Secondary text, eyebrows                |
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

The home page is the headline, a short blurb and the term's facts (linked to the
USC Schedule of Classes, the map and Google Calendar), then the semester as a
scroll story. Its drawing, a team's app window on a rounded tile, opens at the
content's full width under the headline, then shrinks into one half of the page
as the first panel arrives. Four panels follow (the week each part begins, then
demo day), each a mono week label, a one-line promise linking to that part on
the Course page and the part's summary; panel and drawing swap halves each time,
so the eye moves across the page as well as down it. The drawing changes once
per panel, so each panel has one movement. On phones the tile pins under the
header at full width and the words pass beneath it. The people teaching close
the page.

The site has two levels of detail and no more. Home tells the story; the Course
page is the reference, graphics first. It opens on a map of the semester,
generated from the course files: a column per week, a lane per part, and a
numbered shape for every module and step, filled in the part's color (paper for
the curriculum, Gold for the company overview, Cardinal for the capstone).
Hovering a shape names it; pressing it opens a sheet with the detail, centered
on wide screens and rising from the bottom on phones. Sheets are native
popovers, so they need no script and their words stay in the page for search.
The whole semester fits a phone without scrolling sideways. Each part's long
description follows the map.

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

## Motion

Short and quiet, and only opacity, transform or clipping, so it stays smooth on
phones. Content rises in on load and between pages; rows and cards marked
`reveal` rise in as they scroll into view; timeline bars draw in from their
first term. On the home page the story's drawing follows the panels: it settles
into its half as the model's layers light from the bottom up, the camera pulls
back to the companies around the team's window, zooms in as the model shrinks
into the app's corner and the chat appears, and pulls back once more to past
teams' products. Scenes hold while a panel fills the window and change between
panels. The page pins the drawing but never locks or snaps the scroll, which
would fight trackpads, phone momentum and the keyboard. It is pure scroll
timeline, so nothing runs while the page is still. Few parts move, and each
keeps its own layer, painted once at full size and only scaled down after, so
scrolling never repaints the drawing; without a scroll timeline, or under
reduced motion, the drawing is left out and the panels read as a list. Durations
come from tokens, and reduced-motion settings collapse them all to an instant.

Scroll-driven rules use longhand properties: the CSS minifier folds `animation`
and `animation-timeline` into one shorthand that browsers reject.
