# My Diary 📔

A simple diary app where every page is a day. Pick a date, write about it, done.
No accounts, no internet needed — everything saves right in your browser on your
own device.

## How to use it

1. Open `index.html` in any web browser (double-click it, or drag it into a tab).
2. Click **+ Today** to open today's page and start writing.
3. Your writing auto-saves as you type (watch the little "Saved" note).
4. Every day you write becomes its own page, listed on the left, grouped by month.

## Features

- **One page per date** — pages are organized and sorted newest-first.
- **Writing prompts** — stuck? Hit **💡 Give me a prompt** for a random thing
  to write about. "Use it" drops it into your entry, "↻ Another" shuffles.
- **Auto-save** — no save button to remember.
- **Mood line** — jot one word for how the day felt (optional).
- **Search** — find any past entry by word, mood, or date.
- **Change the date** — the date picker at the top moves a page to another day.
- **Delete** — remove a page you don't want.

## How it's built

Plain HTML, CSS, and JavaScript — no frameworks, no build step, nothing to install.
That makes it easy to read and change.

| File         | What it does                                    |
| ------------ | ----------------------------------------------- |
| `index.html` | The page layout (sidebar + editor).             |
| `styles.css` | All the styling and colors.                     |
| `app.js`     | The logic: saving, loading, dates, and search.  |

### Where the data lives

Entries are stored with the browser's `localStorage` under the key
`my-diary-entries-v1`. Each entry looks like this:

```json
{
  "2026-09-17": {
    "date": "2026-09-17",
    "mood": "good",
    "body": "Built a diary app today...",
    "updated": 1758067200000
  }
}
```

Because it's stored in the browser, entries stay on the device you wrote them on.
Clearing your browser data will erase them, so keep that in mind.

## Ideas for later

- Export/import your diary as a file (backup!)
- Dark/light theme toggle button
- Tags or a calendar view
- Password lock
