# Assessment Record Builder

A lightweight formative assessment tool for Games Design and Media. Open `index.html` in a current desktop browser. No installation, build step, account or backend is required.

## Use

1. Enter assessment details. Assessor defaults to Sean Clohessy and feedback date to today.
2. Choose U, Pass, Merit or Distinction for each criterion.
3. Select any optional feedback, add a personal general comment if needed, and generate the assessment. The feedback section starts open and can be collapsed without losing selections.
4. Choose Generate Record (.docx) to download your college Word form, or copy a section/full record, or choose Print / Save as PDF.

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

`script.js` separates record creation, preview rendering and text export with template-based DOCX export in `docx-export.js`. `styles.css` contains screen and A4 print rules. No external fonts, fetch requests or CDNs are used. JSZip 3.10.1 is bundled in vendor/ with its licence for offline DOCX packaging.

## GitHub Pages

Upload `index.html`, `styles.css`, `script.js`, `docx-export.js`, `.nojekyll`, and the `data` and `vendor` folders to the repository root. In repository Settings → Pages, publish from the chosen branch’s root folder. Relative asset paths support project sites. Live site: https://sean-p-clohessy.github.io/AssessmentRecordBuilder/ . Publishing is configured from main / (root); pushes to main update the site.

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


## Word template export

Generate Record (.docx) validates all five grades and downloads the record directly; a separate preview click is not required. Personal comments are appended after the selected development feedback in every output. Blank details remain blank in the Word form. Signatures and student reflections remain empty for completion; the template's date fields use the feedback date.

The export fills a sanitised copy of the supplied Formative Assessment Record Template. It retains the original table, page geometry, typography, Pearson branding, declarations and signature areas. Criterion rows are kept intact across page breaks and section labels stay with their following row. Page count varies with feedback length. The original file is never changed.

`data/record-template.js` embeds the prepared template so direct local-file use also works. `prepare-template.py path/to/template.docx` rebuilds it from the matching 21-row source form using Python's standard library. It strips the legacy Excel mail-merge link and nonvisual sharing/author metadata from the distributed copy. This script expects the supplied table structure; a different template needs its slot map updated.

Verified the production exporter with short, typical and long records, special characters, multiline comments, and literal template-like text. Generated files open in Microsoft Word; all pages were rendered and visually reviewed. XML validation passed and original header/footer/logo/style parts are unchanged. Browser checks cover collapse/expand persistence, custom comments in preview/copy, incomplete-export validation, successful DOCX download, corrected checkmarks and responsive width. No browser console errors were observed.
