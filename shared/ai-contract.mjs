export const intakeFields = ['experience_level','department','goals','skills','availability','training_status','readiness','budget_band'];
export const departments = ['deck','interior','engineering','galley','undecided'];
export function cleanIntake(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid intake');
  /** @type {Record<string, string>} */
  const out = {};
  for (const field of intakeFields) {
    if (value[field] !== undefined && typeof value[field] !== 'string') throw new Error('Invalid intake field');
    const text = (value[field] || '').trim();
    if (text.length > 2000) throw new Error('Intake fields must be at most 2000 characters');
    out[field] = text;
  }
  if (JSON.stringify(out).length > 12000) throw new Error('Intake is too long');
  return out;
}
const str = (v, max) => {if(typeof v !== 'string' || !v.trim() || v.length > max) throw new Error('Invalid AI response');return v.trim();};
const list = (v) => {if(!Array.isArray(v)||v.length>8)throw new Error('Invalid AI response');return v.map(x=>str(x,1000));};
export function validateAssist(v) {
  if(!v||!Array.isArray(v.suggestions)||v.suggestions.length>8)throw new Error('Invalid AI response');
  return {reply:str(v.reply,4000),questions:list(v.questions),suggestions:v.suggestions.map(s=>{
    if(!intakeFields.includes(s.field))throw new Error('Invalid suggestion field');
    const value=str(s.value,2000);
    if(s.field==='department'&&!departments.includes(value))throw new Error('Invalid department');
    return {field:s.field,value,reason:str(s.reason,1000)};
  })};
}
export function validateProposal(v) {
  if(!v||!departments.includes(v.department)||!Array.isArray(v.milestones)||v.milestones.length<1||v.milestones.length>12)throw new Error('Invalid pathway proposal');
  return {department:v.department,target_role:str(v.target_role,200),summary:str(v.summary,4000),milestones:v.milestones.map(m=>({title:str(m.title,200),description:str(m.description,2000),evidence_required:str(m.evidence_required,2000)})),questions_for_coach:list(v.questions_for_coach),limitations:list(v.limitations)};
}
const text={type:'string'};
const textList={type:'array',items:text,maxItems:8};
export const assistSchema={type:'object',properties:{reply:text,questions:textList,suggestions:{type:'array',maxItems:8,items:{type:'object',properties:{field:{type:'string',enum:intakeFields},value:text,reason:text},required:['field','value','reason'],additionalProperties:false}}},required:['reply','questions','suggestions'],additionalProperties:false};
export const proposalSchema={type:'object',properties:{department:{type:'string',enum:departments},target_role:text,summary:text,milestones:{type:'array',minItems:1,maxItems:12,items:{type:'object',properties:{title:text,description:text,evidence_required:text},required:['title','description','evidence_required'],additionalProperties:false}},questions_for_coach:textList,limitations:textList},required:['department','target_role','summary','milestones','questions_for_coach','limitations'],additionalProperties:false};
