# Assessment Record Builder

A dependency-free formative assessment tool for Games Design and Media. Open `index.html` in a current desktop browser. No installation, build step, account or backend is required.

## Use

1. Enter assessment details. Assessor defaults to Sean Clohessy and feedback date to today.
2. Choose U, Pass, Merit or Distinction for each criterion.
3. Select any optional feedback and generate the assessment.
4. Copy a section or the full record, or choose Print / Save as PDF.

All details are optional; missing values appear as “Not provided”. All five grades are required. Changing any input hides the previous record until you generate again, preventing outdated copies. Switching context clears the previous context’s feedback while retaining details, grades and common feedback.

Records exist only in the current page: refreshing or closing it clears them. Copy or print before leaving. No learner details are sent to a server or stored persistently.

For PDF output, use a standard browser such as Edge or Chrome, select A4 and Save as PDF, and disable browser headers/footers if desired. The Codex in-app browser may not expose a native print dialog.

## Edit content

`data/config.js` is the single content file. It contains all 20 supplied descriptors, the standard introduction, 14 supplied common comments, and six sample comments per context.

To add a comment, copy an object in `feedback.common`, `feedback.games` or `feedback.media`:

```js
{
  "id": "games-gameplay-testing",
  "label": "More gameplay testing needed",
  "category": "Testing & Development",
  "text": "Your full feedback paragraph goes here.",
  "placeholder": false
}
```

Use a unique ID across all feedback lists. Categories group automatically; array order controls output order. Keep commas between objects and strings in quotes. The contextual samples are marked `placeholder: true`; replace their wording and set this to false when ready. Changing a criterion descriptor requires no changes to rendering code. Keep the five criterion IDs and grade keys unchanged.

`script.js` separates record creation, preview rendering and text export so DOCX export can be added later. `styles.css` contains screen and A4 print rules. No external fonts, libraries, fetch requests or CDNs are used.

## GitHub Pages

Upload `index.html`, `styles.css`, `script.js` and the `data` folder to the repository root. In repository Settings → Pages, publish from the chosen branch’s root folder. Relative asset paths support project sites. Live site: https://sean-p-clohessy.github.io/AssessmentRecordBuilder/ . Publishing is configured from main / (root); pushes to main update the site.

## Verification

Checked in the browser:

- All 20 grade choices and five generated assessment rows; changing grades and keyboard selection.
- Incomplete assessment warning.
- Common feedback selection/deselection and Games-to-Media context clearing.
- Preservation of learner details, grades and common feedback when switching context.
- All three copy buttons returned the expected section text to the clipboard.
- Reset restored defaults and cleared selections and preview.
- Changes invalidate preview and output controls.
- Desktop four-column, tablet two-column and mobile single-column layouts; no horizontal page overflow at 390px or 800px viewport sizes.
- No browser console errors during interaction checks; JavaScript syntax check passed.

Print-only CSS is implemented, including hidden controls, A4 margins, table borders and page-break rules. The print button was invoked, but the in-app browser did not expose native print preview, so actual PDF pagination remains to be verified in Edge or Chrome. Reset cancellation was not independently verified because the in-app browser’s native confirmation handling was inconsistent.

