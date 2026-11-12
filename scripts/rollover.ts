/**
 * Fails when the current term's classes ended weeks ago and the site still
 * shows it, so a scheduled CI run reminds editors to start the next term:
 *
 *   npm run rollover
 */
import { readFile } from 'node:fs/promises';
import { rolloverReminder } from '@tac/content';

const site = JSON.parse(await readFile('src/content/site.json', 'utf8'));
const id = String(site.currentTerm);
const path = `src/content/terms/${id}/term.json`;
const term = JSON.parse(await readFile(path, 'utf8'));
const end = String(term.classes?.end ?? '');
if (!end) throw new Error(`${path} has no classes.end`);

const reminder = rolloverReminder(
  id,
  end,
  new Date().toISOString().slice(0, 10),
);
if (reminder) {
  console.error(reminder);
  process.exitCode = 1;
} else {
  console.log(`${id} is current until three weeks after ${end}.`);
}
