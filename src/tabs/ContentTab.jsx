import { useState } from 'react'
import { Plus, Download, Edit3, Trash2, ArrowLeft, Film } from 'lucide-react'
import { uid, CONTENT_STATUS, PLATFORMS, XP_REWARDS } from '../utils/helpers.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'
import { exportContentPlanPDF } from '../utils/pdfExport.js'
import { Btn, Input, Card, Chip, Empty, Field, Select, Modal, Bar } from '../components/UI.jsx'

const emptyScript = () => ({ coldOpen:'', act1:'', act2:'', act3:'' })
const emptyPlan = () => ({
  id:uid(), title:'', status:'idea', platform:'', publishDate:'', length:'',
  idea:'', hook:'', audience:'',
  script:emptyScript(),
  sketching:'', thumbnail:'', production:'',
  titleVariations:'', description:'', seo:'', notes:'',
  createdAt:new Date().toISOString(),
})

function NavPills({ active, onChange }) {
  const tabs = [
    {id:'overview', label:'📋 Overview'},
    {id:'concept',  label:'💡 Concept'},
    {id:'script',   label:'✍️ Script'},
    {id:'prod',     label:'🎨 Production'},
    {id:'seo',      label:'🔍 SEO'},
  ]
  return (
    <div className="scroll-row" style={{marginBottom:'20px'}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)} className="pressable" style={{
          flexShrink:0, padding:'8px 14px', borderRadius:'20px', border:'none',
          fontSize:'12px', fontWeight:600, whiteSpace:'nowrap',
          background:active===t.id?'var(--gold)':'var(--card2)',
          color:active===t.id?'#000':'var(--text3)',
          transition:'all .15s',
        }}>{t.label}</button>
      ))}
    </div>
  )
}

function ScriptSection({ label, hint, value, onChange, rows=5 }) {
  return (
    <div style={{marginBottom:'18px'}}>
      <div style={{
        padding:'10px 14px',background:'var(--card2)',
        borderRadius:'var(--r) var(--r) 0 0',
        borderLeft:'3px solid var(--gold)',
      }}>
        <div style={{fontSize:'13px',fontWeight:700,color:'var(--gold)',marginBottom:'2px'}}>{label}</div>
        <div style={{fontSize:'11px',color:'var(--text3)',lineHeight:1.5}}>{hint}</div>
      </div>
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        placeholder="Write in full sentences as you would say them on camera..."
        style={{
          width:'100%',background:'var(--card)',
          border:'1px solid var(--border)',borderTop:'none',
          borderRadius:'0 0 var(--r) var(--r)',
          color:'var(--text)',padding:'12px 14px',fontSize:'13px',
          lineHeight:1.65,resize:'vertical',outline:'none',fontFamily:'var(--font)',
        }}/>
    </div>
  )
}

function PlanEditor({ plan, onSave, onBack, gameStore }) {
  const [form, setForm] = useState(plan)
  const [tab, setTab] = useState('overview')
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (!form.title.trim()) return
    onSave(form)
    setSaved(true)
    setTimeout(()=>setSaved(false), 1500)
  }

  const sc = form.script || emptyScript()
  const scriptFilled = ['coldOpen','act1','act2','act3'].filter(k=>sc[k]?.trim()).length

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px',gap:'10px'}}>
        <button onClick={onBack} className="pressable" style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',color:'var(--text2)',padding:'4px'}}>
          <ArrowLeft size={16}/> Plans
        </button>
        <Btn size="sm" variant={saved?'success':'primary'} onClick={save}>
          {saved?'✓ Saved':'Save'}
        </Btn>
      </div>

      {/* Title */}
      <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
        placeholder="Video title..."
        style={{
          width:'100%',background:'none',border:'none',
          color:'var(--text)',fontSize:'20px',fontWeight:800,outline:'none',
          fontFamily:'var(--font)',marginBottom:'16px',
          borderBottom:'2px solid var(--border)',paddingBottom:'10px',
        }}/>

      <NavPills active={tab} onChange={setTab}/>

      {tab==='overview' && (
        <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <Field label="Status">
              <Select value={form.status} onChange={v=>setForm(f=>({...f,status:v}))}>
                {Object.entries(CONTENT_STATUS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </Select>
            </Field>
            <Field label="Platform">
              <Select value={form.platform} onChange={v=>setForm(f=>({...f,platform:v}))}>
                <option value="">Select</option>
                {PLATFORMS.map(p=><option key={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <Field label="Publish date">
              <Input value={form.publishDate||''} onChange={v=>setForm(f=>({...f,publishDate:v}))} placeholder="Jan 15"/>
            </Field>
            <Field label="Length">
              <Input value={form.length||''} onChange={v=>setForm(f=>({...f,length:v}))} placeholder="8–12 min"/>
            </Field>
          </div>
          <Field label="Notes">
            <Input value={form.notes||''} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Anything to track..." multiline rows={3}/>
          </Field>
        </div>
      )}

      {tab==='concept' && (
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Field label="💡 Core Idea" hint="What is this video about? What insight or story are you delivering?">
            <Input value={form.idea||''} onChange={v=>setForm(f=>({...f,idea:v}))} placeholder="The big idea..." multiline rows={4}/>
          </Field>
          <Field label="🎣 The Hook" hint="What stops someone from scrolling in the first 3 seconds?">
            <Input value={form.hook||''} onChange={v=>setForm(f=>({...f,hook:v}))} placeholder="One powerful hook sentence..." multiline rows={2}/>
          </Field>
          <Field label="🎯 Target Audience" hint="Who is this for? What do they struggle with?">
            <Input value={form.audience||''} onChange={v=>setForm(f=>({...f,audience:v}))} placeholder="Your ideal viewer for this video..." multiline rows={3}/>
          </Field>
        </div>
      )}

      {tab==='script' && (
        <div>
          <div style={{padding:'10px 14px',background:'var(--xp-soft)',border:'1px solid rgba(124,92,252,.2)',borderRadius:'var(--r-sm)',marginBottom:'16px'}}>
            <div style={{fontSize:'12px',color:'var(--xp)',fontWeight:600,marginBottom:'3px'}}>📝 Script Mode</div>
            <div style={{fontSize:'11px',color:'var(--text3)',lineHeight:1.5}}>Write full sentences — not bullet points. This is your actual script.</div>
            {scriptFilled===4 && <div style={{fontSize:'12px',color:'var(--green)',fontWeight:700,marginTop:'6px'}}>✅ All 4 acts written!</div>}
            {scriptFilled<4 && <div style={{marginTop:'8px'}}><Bar value={scriptFilled} max={4} color="var(--xp)"/><span style={{fontSize:'10px',color:'var(--text3)'}}>{scriptFilled}/4 acts</span></div>}
          </div>
          <ScriptSection label="🎬 Cold Open / Hook" hint="Word-for-word what you say in the first 15–30 seconds." value={sc.coldOpen} onChange={v=>setForm(f=>({...f,script:{...f.script,coldOpen:v}}))} rows={5}/>
          <ScriptSection label="📖 Act 1 — Setup" hint="Establish context. Introduce the problem." value={sc.act1} onChange={v=>setForm(f=>({...f,script:{...f.script,act1:v}}))} rows={6}/>
          <ScriptSection label="🔥 Act 2 — Main Content" hint="The core value. Your argument, tutorial, or story." value={sc.act2} onChange={v=>setForm(f=>({...f,script:{...f.script,act2:v}}))} rows={10}/>
          <ScriptSection label="🎯 Act 3 — Conclusion & CTA" hint="Land the takeaway, deliver your call-to-action." value={sc.act3} onChange={v=>setForm(f=>({...f,script:{...f.script,act3:v}}))} rows={5}/>
        </div>
      )}

      {tab==='prod' && (
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Field label="🎨 Shot List & Sketching" hint="Scenes, b-roll, graphics, transitions, visual ideas.">
            <Input value={form.sketching||''} onChange={v=>setForm(f=>({...f,sketching:v}))} placeholder="Scene 1: ..., B-roll: ..., Graphics: ..." multiline rows={6}/>
          </Field>
          <Field label="🖼️ Thumbnail Concept" hint="Color, text overlay, expression, focal element.">
            <Input value={form.thumbnail||''} onChange={v=>setForm(f=>({...f,thumbnail:v}))} placeholder="Background, face expression, text: '...'" multiline rows={3}/>
          </Field>
          <Field label="⚙️ Production Notes" hint="Equipment, location, music, editing style.">
            <Input value={form.production||''} onChange={v=>setForm(f=>({...f,production:v}))} placeholder="Camera: ..., Music: ..., Editing: ..." multiline rows={4}/>
          </Field>
        </div>
      )}

      {tab==='seo' && (
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Field label="📝 Title Variations" hint="Write 3–5 options. Pick the best later.">
            <Input value={form.titleVariations||''} onChange={v=>setForm(f=>({...f,titleVariations:v}))} placeholder={"1. ...\n2. ...\n3. ..."} multiline rows={5}/>
          </Field>
          <Field label="📄 Description Draft">
            <Input value={form.description||''} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Description with keywords..." multiline rows={5}/>
          </Field>
          <Field label="🔍 Keywords & Tags">
            <Input value={form.seo||''} onChange={v=>setForm(f=>({...f,seo:v}))} placeholder="keyword1, keyword2, ..." multiline rows={2}/>
          </Field>
        </div>
      )}
    </div>
  )
}

function PlanCard({ plan, onEdit, onDelete, onExport, exporting }) {
  const statusColor = {idea:'var(--text3)',scripting:'var(--blue)',shooting:'var(--gold)',editing:'var(--xp)',scheduled:'var(--green)',published:'var(--green)'}
  const filled = ['idea','hook','audience','sketching','thumbnail'].filter(f=>plan[f]?.trim()).length
    + ['coldOpen','act1','act2','act3'].filter(f=>plan.script?.[f]?.trim()).length
  const total = 9

  return (
    <Card className="anim-up" style={{marginBottom:'10px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px',marginBottom:'10px'}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:'15px',color:'var(--text)',marginBottom:'6px',lineHeight:1.3}}>
            {plan.title||'Untitled'}
          </div>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            <Chip color={statusColor[plan.status]||'var(--text3)'}>{CONTENT_STATUS[plan.status]||plan.status}</Chip>
            {plan.platform && <Chip color="var(--blue)">{plan.platform}</Chip>}
            {plan.publishDate && <Chip color="var(--text3)">📅 {plan.publishDate}</Chip>}
          </div>
        </div>
        <Film size={18} style={{color:'var(--text3)',flexShrink:0}}/>
      </div>

      {plan.idea && (
        <p style={{fontSize:'12px',color:'var(--text2)',marginBottom:'10px',lineHeight:1.5,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {plan.idea}
        </p>
      )}

      <div style={{marginBottom:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
          <span style={{fontSize:'10px',color:'var(--text3)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Plan completion</span>
          <span style={{fontSize:'10px',color:'var(--text3)',fontFamily:'var(--mono)'}}>{Math.round((filled/total)*100)}%</span>
        </div>
        <Bar value={filled} max={total} h={4}/>
      </div>

      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        <Btn size="sm" variant="subtle" onClick={()=>onEdit(plan)}><Edit3 size={12}/> Edit</Btn>
        <Btn size="sm" variant="subtle" onClick={()=>onExport(plan)} disabled={exporting===plan.id} style={{color:'var(--gold)'}}>
          <Download size={12}/> {exporting===plan.id?'…':'PDF'}
        </Btn>
        <Btn size="sm" variant="danger" onClick={()=>onDelete(plan.id)}><Trash2 size={12}/></Btn>
      </div>
    </Card>
  )
}

export default function ContentTab({ gameStore }) {
  const [plans, setPlans] = useLocalStorage('momentum_content_v1', [])
  const [editing, setEditing] = useState(null)
  const [exporting, setExporting] = useState(null)
  const [filter, setFilter] = useState('all')

  const openNew = () => setEditing(emptyPlan())
  const openEdit = p => setEditing({...p,script:{...p.script}})

  const savePlan = (form) => {
    if (!form.title.trim()) return
    const isNew = !plans.find(p=>p.id===form.id)
    if (isNew) {
      setPlans(p=>[form,...p])
      gameStore.addXP(XP_REWARDS.planCreated, '🎬 Content plan created')
    } else {
      // Check if script is now complete
      const sc = form.script||{}
      const scriptComplete = ['coldOpen','act1','act2','act3'].every(k=>sc[k]?.trim())
      const oldPlan = plans.find(p=>p.id===form.id)
      const wasComplete = oldPlan?.script && ['coldOpen','act1','act2','act3'].every(k=>oldPlan.script[k]?.trim())
      if (scriptComplete && !wasComplete) {
        gameStore.addXP(XP_REWARDS.planCreated, '✍️ Full script written!')
        const s = {...gameStore.stats, scriptsWritten:(gameStore.stats.scriptsWritten||0)+1}
        gameStore.updateStats(s)
        gameStore.checkBadges(s)
      }
      if (form.status==='published') {
        const oldStatus = plans.find(p=>p.id===form.id)?.status
        if (oldStatus !== 'published') {
          gameStore.addXP(XP_REWARDS.planPublished, '🚀 Video published!')
          const s = {...gameStore.stats, plansPublished:(gameStore.stats.plansPublished||0)+1}
          gameStore.updateStats(s)
          gameStore.checkBadges(s)
        }
      }
      setPlans(p=>p.map(x=>x.id===form.id?form:x))
    }
    setEditing(null)
  }

  const deletePlan = id => { if(confirm('Delete this plan?')) setPlans(p=>p.filter(x=>x.id!==id)) }

  const exportPDF = async (plan) => {
    setExporting(plan.id)
    try { await exportContentPlanPDF(plan) }
    catch(e) { alert('PDF export failed: '+e.message) }
    finally { setExporting(null) }
  }

  if (editing) return <PlanEditor plan={editing} onSave={savePlan} onBack={()=>setEditing(null)} gameStore={gameStore}/>

  const filtered = filter==='all' ? plans : plans.filter(p=>p.status===filter)

  return (
    <div>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'20px'}}>
        {[
          {label:'Total',     value:plans.length,                                 color:'var(--gold)'},
          {label:'In Progress',value:plans.filter(p=>!['idea','published'].includes(p.status)).length, color:'var(--xp)'},
          {label:'Published', value:plans.filter(p=>p.status==='published').length, color:'var(--green)'},
        ].map(s=>(
          <div key={s.label} className="anim-up" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.value}</div>
            <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'2px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter + new */}
      <div style={{display:'flex',gap:'6px',marginBottom:'16px',alignItems:'center'}}>
        <div className="scroll-row" style={{flex:1,marginBottom:0,paddingBottom:0}}>
          {['all',...Object.keys(CONTENT_STATUS)].map(k=>(
            <button key={k} onClick={()=>setFilter(k)} className="pressable" style={{
              flexShrink:0,padding:'6px 12px',borderRadius:'20px',border:'none',
              fontSize:'11px',fontWeight:600,
              background:filter===k?'var(--gold)':'var(--card2)',
              color:filter===k?'#000':'var(--text3)',
              transition:'all .15s',whiteSpace:'nowrap',
            }}>
              {k==='all'?'All':CONTENT_STATUS[k]}
            </button>
          ))}
        </div>
        <Btn size="sm" onClick={openNew} style={{flexShrink:0}}><Plus size={14}/></Btn>
      </div>

      {filtered.length===0 && (
        <Empty icon="🎬" title={filter==='all'?'No content plans':'No plans here'} sub={filter==='all'?'Start planning your next video.':undefined}/>
      )}

      <div className="stagger">
        {filtered.map(p=>(
          <PlanCard key={p.id} plan={p} onEdit={openEdit} onDelete={deletePlan} onExport={exportPDF} exporting={exporting}/>
        ))}
      </div>
    </div>
  )
}
