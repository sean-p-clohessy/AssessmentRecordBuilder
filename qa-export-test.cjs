const fs = require('fs');
global.window=global;global.JSZip=require('./vendor/jszip.min.js');
require('./data/config.js');require('./data/record-template.js');require('./docx-export.js');
(async()=>{
 const details={learner:'Alex Example',assessor:'Sean Clohessy',project:'Environment Design',feedbackDate:'2026-09-08',deadline:'2026-09-07',submitted:'2026-09-08',programme:'BTEC Level 3 Creative Media Practice',unit:'A1: Skills Development',extension:'Yes'};
 for(const [name,grade,count] of [['sample','merit',3],['long','distinction',14],['short','u',0]]) {
  const c=ASSESSMENT_CONFIG;
  const record={details,assessment:c.criteria.map(x=>({criterion:x.title,grade:grade==='u'?'U':grade[0].toUpperCase()+grade.slice(1),comment:x.grades[grade]})),general:[c.introduction,...c.feedback.common.slice(0,count).map(x=>x.text),'A strong start & thoughtful ideas.\nKeep testing <new> approaches. Literal {{learner}} and $& are safe.']};
  const blob=await AssessmentDocx.create(record);fs.writeFileSync(`qa/${name}.docx`,Buffer.from(await blob.arrayBuffer()));
 }
 console.log('Created 3 export fixtures using production exporter.');
})();
