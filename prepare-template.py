"""Rebuild the embedded Word template from the college's reference DOCX.
Usage: python prepare-template.py path/to/reference.docx
Uses only Python's standard library. Never modifies the source file.
"""
import base64
import hashlib
import io
import json
import re
import sys
import zipfile
from pathlib import Path

# Patch only document slots; keep the original namespace declarations and
# unrelated OOXML bytes intact (including compatibility namespaces).
source = Path(sys.argv[1])
with zipfile.ZipFile(source) as archive:
    parts = {name: archive.read(name) for name in archive.namelist()}
original = parts['word/document.xml'].decode('utf-8')
rows = list(re.finditer(r'<w:tr[ >].*?</w:tr>', original, re.S))
assert len(rows) == 21, 'Expected the 21-row college assessment table.'


def paragraph(cell, marker):
    p = re.search(r'<w:p[ >].*?</w:p>', cell, re.S).group()
    ppr = re.search(r'<w:pPr[ >].*?</w:pPr>', p, re.S)
    rpr = re.search(r'<w:rPr[ >].*?</w:rPr>', p, re.S)
    return '<w:p>' + (ppr.group() if ppr else '') + '<w:r>' + (rpr.group() if rpr else '') + '<w:t xml:space="preserve">{{' + marker + '}}</w:t></w:r></w:p>'


slots = {1: {1: 'learner', 3: 'assessor'}, 2: {1: 'project', 3: 'feedbackDate'},
         3: {1: 'deadline', 3: 'submitted'}, 4: {2: 'unit'}, 5: {0: 'programme'},
         6: {1: 'extension'}, 14: {0: 'general'},
         18: {2: 'feedbackDate'}, 20: {2: 'feedbackDate'}}
for i in range(5):
    slots[8+i] = {1: f'grade{i}', 2: f'comment{i}'}
document = original
for index in sorted(slots, reverse=True):
    row = rows[index].group()
    cells = list(re.finditer(r'<w:tc[ >].*?</w:tc>', row, re.S))
    for cell_index, marker in sorted(slots[index].items(), reverse=True):
        cell = cells[cell_index].group()
        props = re.search(r'<w:tcPr[ >].*?</w:tcPr>', cell, re.S)
        replacement = '<w:tc>' + (props.group() if props else '') + paragraph(cell, marker) + '</w:tc>'
        row = row[:cells[cell_index].start()] + replacement + row[cells[cell_index].end():]
    document = document[:rows[index].start()] + row + document[rows[index].end():]
document = document.replace(' (delete as appropriate)', '').replace('(delete as appropriate)', '')
# Keep each criterion intact, and keep section labels/signature pairs with the
# following row. This changes pagination only, not the template's appearance.
flow_rows = list(re.finditer(r'<w:tr[ >].*?</w:tr>', document, re.S))
for index in reversed(range(len(flow_rows))):
    row = flow_rows[index].group()
    if index in [8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20]:
        row = row.replace('<w:trPr>', '<w:trPr><w:cantSplit/>', 1) if '<w:trPr>' in row else re.sub(r'(<w:tr\b[^>]*>)', r'\1<w:trPr><w:cantSplit/></w:trPr>', row, count=1)
    if index in [7, 13, 15, 17, 19]:
        row = re.sub(r'<w:pPr>', '<w:pPr><w:keepNext/>', row)
    document = document[:flow_rows[index].start()] + row + document[flow_rows[index].end():]
assert 'MERGEFIELD' not in document
parts['word/document.xml'] = document.encode('utf-8')

# The original contains a legacy local Excel mail-merge connection and
# SharePoint sharing metadata. These are not part of the printed form.
# Remove them from the distributed copy, retaining all visual package parts.
removed = {name for name in parts if name.startswith('customXml/')}
removed.update({'word/_rels/settings.xml.rels', 'docProps/custom.xml', 'word/intelligence2.xml'})
for name in removed:
    parts.pop(name, None)
for name in list(parts):
    if name.endswith('.rels'):
        text = parts[name].decode('utf-8')
        text = re.sub(r'<Relationship\b[^>]*/>', lambda m: '' if any(k in m.group() for k in ['customXml', 'custom-properties', 'intelligence', 'mailMergeSource']) else m.group(), text)
        parts[name] = text.encode('utf-8')
text = parts['[Content_Types].xml'].decode('utf-8')
text = re.sub(r'<Override\b[^>]*/>', lambda m: '' if any('PartName="/'+n+'"' in m.group() for n in removed) else m.group(), text)
parts['[Content_Types].xml'] = text.encode('utf-8')
settings = parts['word/settings.xml'].decode('utf-8')
settings = re.sub(r'<w:mailMerge>.*?</w:mailMerge>', '', settings, flags=re.S)
settings = re.sub(r'<w:docVars>.*?</w:docVars>', '', settings, flags=re.S)
settings = re.sub(r'<w:updateFields\b[^>]*/>', '', settings)
settings = settings.replace('</w:settings>', '<w:updateFields w:val="true"/></w:settings>')
parts['word/settings.xml'] = settings.encode('utf-8')
parts['docProps/core.xml'] = b'<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Formative Assessment Record</dc:title></cp:coreProperties>'
buffer = io.BytesIO()
with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, data in parts.items():
        z.writestr(name, data)
Path('data/record-template.js').write_text('// Generated from the college Word template by prepare-template.py.\n// Layout, styles, logos, declarations and signature spaces are preserved.\nwindow.ASSESSMENT_DOCX_TEMPLATE = ' + json.dumps(base64.b64encode(buffer.getvalue()).decode('ascii')) + ';\n', encoding='utf-8')
qa = Path('qa'); qa.mkdir(exist_ok=True)
(qa/'prepared-template.docx').write_bytes(buffer.getvalue())
(qa/'artifact.md').write_text(f'''# Template contract
Reference: {source}
SHA-256: {hashlib.sha256(source.read_bytes()).hexdigest()}
One portrait A4 section, 11906 x 16838 twips. Margins top/left 720, right 622, bottom 426; header 450, footer 463.
Single table, 21 rows with original six-column grid and merged cells.
Open Sans typography, original paragraph spacing, blue labels, grey fills, dotted blue details borders.
Preserve header1/2/3, footer1/2/3, media, styles, theme, numbering, relationships to visual parts and section properties byte-for-byte.
Slots: {slots}
Each slot retains the original cell properties and first paragraph/run properties. General comments repeat that paragraph for each selected/custom paragraph.
Criteria cannot split across pages. Section labels and declaration signature pairs stay with their following row.
Blank reflection and signature spaces remain. Feedback date fills existing declaration dates, without adding signatures.
Remove the editing hint in unit heading, legacy mail merge, nonvisual SharePoint metadata, stale author properties and intelligence data.
The packaged LibreOffice renderer is unavailable on this Windows machine; native Word PDF export is the fidelity fallback.
''', encoding='utf-8')
print('Prepared template:', len(buffer.getvalue()), 'bytes;', len(parts), 'parts')
