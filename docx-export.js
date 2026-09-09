/* Fill the original college template locally. JSZip is vendored so this works
   offline and under file:// as well as on GitHub Pages. No learner data leaves
   the browser. Layout changes belong in the source Word template. */
(() => {
  'use strict';
  const xmlText = value => String(value ?? '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;')
    .replace(/\r\n?|\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
  const date = value => value ? value.split('-').reverse().join('/') : '';

  async function create(record) {
    if (record.assessment.length !== 5) throw new Error('Five assessment rows are required.');
    const zip = await JSZip.loadAsync(window.ASSESSMENT_DOCX_TEMPLATE, {base64:true});
    let xml = await zip.file('word/document.xml').async('string');
    const values = {...record.details};
    for (const key of ['feedbackDate', 'deadline', 'submitted']) values[key] = date(values[key]);
    record.assessment.forEach((row,i) => { values[`grade${i}`] = row.grade; values[`comment${i}`] = row.comment; });
    // Expand the original comment paragraph, preserving its exact formatting.
    // Fill scalar tokens in the same pass so user text resembling {{tokens}}
    // is never interpreted as a second template instruction.
    xml = xml.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, paragraph => {
      if (paragraph.includes('{{general}}')) {
        return record.general.map(text => paragraph.replace('{{general}}', () => xmlText(text))).join('');
      }
      return paragraph.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (!Object.hasOwn(values,key)) throw new Error(`Unknown template slot: ${key}`);
        return xmlText(values[key]);
      });
    });
    zip.file('word/document.xml', xml);
    return zip.generateAsync({type:'blob', compression:'DEFLATE', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
  }
  window.AssessmentDocx = {create};
})();
