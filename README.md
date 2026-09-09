# Assessment Record Builder

A lightweight formative assessment tool for Games Design and Media. Open `index.html` in a current desktop browser. No installation, build step, account or backend is required.

## Use

1. Enter assessment details. Assessor defaults to Sean Clohessy and feedback date to today.
2. Choose U, Pass, Merit or Distinction for each criterion.
3. Select any optional feedback, add a personal general comment if needed, and generate the assessment. Common feedback starts open and can be collapsed without losing selections. The corresponding subject panel remains visible separately.
4. Choose Generate Record (.docx) to download your college Word form, or copy a section/full record, or choose Print / Save as PDF.

Learner/project/date details are optional; missing values appear as “Not provided”. The unit selector defaults to A1. Programme title is filled on load, reset and context change using “BTEC Level 3 Creative Media Practice in [context]”; it remains editable. All five grades are required. Changing any input hides the previous record until you generate again, preventing outdated copies. Switching context clears the previous context’s feedback while retaining details, grades and common feedback.

Records exist only in the current page: refreshing or closing it clears them. Copy or print before leaving. No learner details are sent to a server or stored persistently.

For PDF output, use a standard browser such as Edge or Chrome, select A4 and Save as PDF, and disable browser headers/footers if desired. The Codex in-app browser may not expose a native print dialog.

## Edit content

`data/config.js` is the single content file. It contains all 20 supplied descriptors, the standard introduction, 14 supplied common comments, 12 additional specification-based common comments, 8 Games Design comments and 12 Media/photography comments.

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

Use a unique ID across all feedback lists. Categories group automatically; array order controls output order. Keep commas between objects and strings in quotes. The contextual feedback is based on the supplied specification; `sourcePages` records its printed page references. Changing a criterion descriptor requires no changes to rendering code. Keep the five criterion IDs and grade keys unchanged.

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

## Specification-based feedback

Source: Pearson BTEC Level 3 National 540 Diploma/Extended Diploma in Creative Media Practice, Issue 3 (May 2021), supplied PDF. New options paraphrase the teaching content on printed pages 20–26 and 32–38 (PDF pages 24–30 and 36–42). They are optional developmental guidance, not new grade descriptors. Photography appears under Media. Technical examples are indicative; select only those appropriate to the assignment.

| Context | Feedback option | Printed source pages |
| --- | --- | --- |
| common | Define your target audience | 20 |
| common | Cross-check your research sources | 33 |
| common | Plan around the brief’s constraints | 20, 34 |
| common | Act on testing and feedback | 21, 34 |
| common | Evaluate outcomes against intentions | 26, 34 |
| common | Organise and back up your files | 25, 35 |
| common | Check permissions and credit sources | 25, 36 |
| common | Document risks and safe working | 25 |
| common | Improve readability and accessibility | 24, 36 |
| common | Rehearse and clarify your pitch | 38 |
| common | Set clear progression goals | 32, 34 |
| common | Tailor your portfolio or showreel | 35, 37 |
| games | Refine modelling and topology | 22 |
| games | Develop textures and materials | 22 |
| games | Optimise assets for the target platform | 22, 23 |
| games | Develop engine implementation | 23 |
| games | Clarify gameplay goals and mechanics | 23 |
| games | Test level layout and viewpoints | 21, 23 |
| games | Record and resolve gameplay bugs | 21 |
| games | Use sound to support gameplay | 23 |
| media | Improve framing and camera choices | 22, 23 |
| media | Strengthen continuity and sequencing | 22 |
| media | Refine editing pace and transitions | 22 |
| media | Improve audio capture and levels | 23 |
| media | Balance dialogue, music and effects | 23 |
| media | Control lighting and colour balance | 22, 23 |
| media | Control exposure and depth of field | 23 |
| media | Refine photographic composition | 23, 24 |
| media | Refine image editing and retouching | 23 |
| media | Check resolution and export settings | 22, 23 |
| media | Develop storyboards and shot planning | 21, 25 |
| media | Keep production paperwork current | 25 |
