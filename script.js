/* Configuration is in data/config.js. The record model is independent of the
   preview and plain-text exporters so another exporter can be added later. */
(() => {
  'use strict';
  const config = window.ASSESSMENT_CONFIG;
  const $ = id => document.getElementById(id);
  const grades = { u: 'U', pass: 'Pass', merit: 'Merit', distinction: 'Distinction' };
  const fields = { learner: 'Learner name', assessor: 'Assessor', project: 'Project title', feedbackDate: 'Feedback date', deadline: 'Deadline', submitted: 'Submitted date', programme: 'Programme title', unit: 'Assessment unit', extension: 'Extension approved' };
  const state = { grades: {}, feedback: new Set(), context: 'games', record: null };
  const form = $('details');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  form.elements.unit.innerHTML = config.units.map(unit => `<option>${escape(unit)}</option>`).join('');
  function setProgrammeTitle() { form.elements.programme.value = `BTEC Level 3 Creative Media Practice in ${config.contexts[state.context]}`; }
  setProgrammeTitle();
  form.elements.feedbackDate.value = localDate();
  let defaults = new URLSearchParams(new FormData(form)).toString();
  function renderCriteria() {
    $('criteria').innerHTML = config.criteria.map(c => `<div class="criterion" role="group" aria-labelledby="${c.id}-heading"><div class="criterion-heading"><h3 id="${c.id}-heading"><span>${c.id.toUpperCase()}</span>${escape(c.title)}</h3><span class="selection-label" id="${c.id}-selection">Not graded</span></div><div class="grade-grid">${Object.entries(grades).map(([key,label]) => `<button type="button" class="grade-card" data-criterion="${c.id}" data-grade="${key}" aria-pressed="false"><strong>${label}</strong><span class="descriptor">${escape(c.grades[key])}</span></button>`).join('')}</div></div>`).join('');
  }
  function feedbackMarkup(items) {
    return [...new Set(items.map(i => i.category))].map(category => `<div class="feedback-group"><h3>${escape(category)}</h3><div class="feedback-grid">${items.filter(i => i.category === category).map(i => `<button type="button" class="feedback-card" data-feedback="${escape(i.id)}" aria-pressed="${state.feedback.has(i.id)}">${escape(i.label)}</button>`).join('')}</div></div>`).join('');
  }
  function renderContext() {
    $('context-heading').textContent = `${state.context === 'games' ? 'Games Design' : 'Media'} feedback`;
    $('context-feedback').innerHTML = feedbackMarkup(config.feedback[state.context]);

  }
  function invalidate() {
    if (state.record) $('status').textContent = 'Assessment changed. Generate again to update the preview and enable output.';
    state.record = null;
    $('output-actions').hidden = true;
    $('record').hidden = true;
    $('empty-preview').hidden = false;
    $('validation').textContent = '';
  }
  function counts() {
    $('progress').textContent = `${Object.keys(state.grades).length} / 5 criteria completed`;
    $('feedback-count').textContent = `${state.feedback.size} feedback point${state.feedback.size === 1 ? '' : 's'} selected`;
  }
  $('criteria').addEventListener('click', e => {
    const button = e.target.closest('[data-criterion]'); if (!button) return;
    state.grades[button.dataset.criterion] = button.dataset.grade;
    button.closest('.grade-grid').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $(button.dataset.criterion + '-selection').textContent = `${grades[button.dataset.grade]} selected`;
    invalidate(); counts();
  });
  for (const id of ['common-feedback', 'context-feedback']) $(id).addEventListener('click', e => {
    const b = e.target.closest('[data-feedback]'); if (!b) return;
    const key = b.dataset.feedback;
    state.feedback.has(key) ? state.feedback.delete(key) : state.feedback.add(key);
    b.setAttribute('aria-pressed', String(state.feedback.has(key))); invalidate(); counts();
  });
  $('context').addEventListener('change', () => {
    config.feedback[state.context].forEach(i => state.feedback.delete(i.id));
    state.context = $('context').value; setProgrammeTitle(); renderContext(); counts(); invalidate();
  });
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', e => e.preventDefault());
  $('general-comment').addEventListener('input', invalidate);
  $('toggle-feedback').addEventListener('click', () => {
    const open = $('toggle-feedback').getAttribute('aria-expanded') === 'true';
    $('feedback-content').hidden = open;
    $('toggle-feedback').setAttribute('aria-expanded', String(!open));
    $('toggle-feedback').textContent = open ? 'Expand feedback' : 'Collapse feedback';
  });
  function createRecord() {
    const details = Object.fromEntries(new FormData(form));
    return { details, assessment: config.criteria.map(c => ({ criterion: `${c.id.toUpperCase()}: ${c.title}`, grade: grades[state.grades[c.id]], comment: c.grades[state.grades[c.id]] })), general: [config.introduction, ...[...config.feedback.common, ...config.feedback[state.context]].filter(i => state.feedback.has(i.id)).map(i => i.text), ...details.generalComment.trim().split(/\n\s*\n/).filter(Boolean)] };
  }
  const formatValue = (key,value) => !value.trim() ? 'Not provided' : ['feedbackDate','deadline','submitted'].includes(key) ? new Date(value+'T12:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}) : value;
  function renderRecord(r) {
    $('record').innerHTML = `<h2>Formative Assessment Record</h2><h3>Assessment Details</h3><div class="record-details">${Object.entries(fields).map(([key,label]) => `<p><strong>${label}:</strong> ${escape(formatValue(key,r.details[key]))}</p>`).join('')}<p><strong>Context:</strong> ${r.details.context === 'games' ? 'Games Design' : 'Media'}</p></div><h3>Assessment</h3><table><thead><tr><th scope="col">Criteria</th><th scope="col">Grade</th><th scope="col">Assessment Comments</th></tr></thead><tbody>${r.assessment.map(a => `<tr><th scope="row">${escape(a.criterion)}</th><td>${a.grade}</td><td>${escape(a.comment)}</td></tr>`).join('')}</tbody></table><h3>General Comments</h3>${r.general.map(p => `<p>${escape(p)}</p>`).join('')}<h3>Student Reflection &amp; Actions</h3><div class="reflection-space"></div>`;
    $('record').hidden = false; $('empty-preview').hidden = true; $('output-actions').hidden = false;
  }
  function generateAssessment() {
    const missing = config.criteria.find(c => !state.grades[c.id]);
    if (missing) { $('validation').textContent = 'Please select a grade for all five assessment criteria.'; document.querySelector(`[data-criterion="${missing.id}"]`).focus(); return; }
    $('validation').textContent = ''; state.record = createRecord(); renderRecord(state.record);
    $('status').textContent = 'Assessment ready. Review below, then copy or print.';
    return state.record;
  }
  $('generate').addEventListener('click', () => {
    if (!generateAssessment()) return;
    $('output').scrollIntoView({behavior:'smooth',block:'start'});
  });
  $('generate-docx').addEventListener('click', async () => {
    const record = generateAssessment();
    if (!record) return;
    const button = $('generate-docx'); button.disabled = true;
    button.textContent = 'Preparing record…';
    try {
      const blob = await window.AssessmentDocx.create(record);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const name = [record.details.learner || 'Learner', record.details.project || 'Assessment'].join(' - ').replace(/[<>:"/\\|?*\x00-\x1f]/g, '').slice(0,150);
      link.href = url; link.download = `${name} - Formative Record.docx`;
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      $('status').textContent = 'Word record downloaded. Open it to review or print.';
    } catch (error) {
      $('status').textContent = 'The Word record could not be generated. Please reload and try again. Your preview can still be copied.';
      console.error('DOCX export failed:', error);
    } finally { button.disabled = false; button.textContent = 'Generate Record (.docx)'; }
  });
  function exportText(r, part) {
    const assessment = r.assessment.map(a => `${a.criterion} — ${a.grade}\n${a.comment}`).join('\n\n');
    const general = r.general.join('\n\n');
    if (part === 'assessment') return assessment;
    if (part === 'general') return general;
    return `FORMATIVE ASSESSMENT RECORD\n\nASSESSMENT DETAILS\n${Object.entries(fields).map(([key,label]) => `${label}: ${formatValue(key,r.details[key])}`).join('\n')}\nContext: ${r.details.context === 'games' ? 'Games Design' : 'Media'}\n\nASSESSMENT\n\n${assessment}\n\nGENERAL COMMENTS\n\n${general}\n\nSTUDENT REFLECTION & ACTIONS\n\n`;
  }
  async function copyText(text) {
    try { if (!navigator.clipboard?.writeText) throw new Error('Fallback'); await navigator.clipboard.writeText(text); }
    catch (_) {
      const active = document.activeElement, area = document.createElement('textarea');
      area.value = text; area.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; document.body.append(area); area.select();
      const ok = document.execCommand('copy'); area.remove(); active?.focus();
      if (!ok) throw new Error('Clipboard unavailable');
    }
  }
  $('output-actions').addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]'); if (!b || !state.record) return;
    try { await copyText(exportText(state.record,b.dataset.copy)); $('status').textContent = `${b.textContent.replace(/^Copy /,'')} copied to clipboard.`; }
    catch (_) { $('status').textContent = 'Copy was blocked by your browser. Select the preview text and copy it manually.'; }
  });
  $('print').addEventListener('click', () => { if (state.record) window.print(); });
  $('reset').addEventListener('click', () => {
    const dirty = Object.keys(state.grades).length || state.feedback.size || new URLSearchParams(new FormData(form)).toString() !== defaults;
    if (dirty && !window.confirm('Reset this assessment? Entered details, grades and feedback will be cleared.')) return;
    form.reset(); state.context = 'games'; setProgrammeTitle(); form.elements.feedbackDate.value = localDate(); defaults = new URLSearchParams(new FormData(form)).toString();
    state.grades = {}; state.feedback.clear(); state.context = 'games'; invalidate();
    $('feedback-content').hidden = false; $('toggle-feedback').setAttribute('aria-expanded', 'true'); $('toggle-feedback').textContent = 'Collapse feedback';
    renderCriteria(); $('common-feedback').innerHTML = feedbackMarkup(config.feedback.common); renderContext(); counts();
    $('status').textContent = 'Assessment reset.'; form.elements.learner.focus();
  });
  renderCriteria(); $('common-feedback').innerHTML = feedbackMarkup(config.feedback.common); renderContext(); counts();
})();
