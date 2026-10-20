/**
 * Fails when the current term's classes ended weeks ago and the site still
 * shows it, so a scheduled CI run reminds editors to start the next term:
 *
 *   npm run rollover
 */
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';
import { rolloverReminder } from '../src/lib/term.ts';

const site = parse(await readFile('src/content/site.yaml', 'utf8'));
const id: string = site.currentTerm;
const term = parse(await readFile(`src/content/terms/${id}.yaml`, 'utf8'));
const end = String(term.classes?.end ?? '');
if (!end) throw new Error(`src/content/terms/${id}.yaml has no classes.end`);

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
