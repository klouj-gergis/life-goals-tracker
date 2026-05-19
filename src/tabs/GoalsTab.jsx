import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { uid, CATEGORIES, XP_REWARDS } from '../utils/helpers.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'
import { Btn, Input, Modal, Card, Section, Chip, Bar, Empty, Field, Select } from '../components/UI.jsx'

function GoalCard({ goal, onToggle, onToggleST, onDelete, onDeleteST, onAddST, onXP }) {
  const [open, setOpen] = useState(true)
  const [adding, setAdding] = useState(false)
  const [stForm, setStForm] = useState({ title:'', deadline:'' })

  const stDone = goal.shortTerms.filter(s=>s.done).length
  const stTotal = goal.shortTerms.length
  const pct = stTotal > 0 ? Math.round((stDone/stTotal)*100) : (goal.done ? 100 : 0)

  const handleToggle = () => {
    const wasDone = goal.done
    onToggle(goal.id)
    if (!wasDone) onXP(XP_REWARDS.goalDone, '🎯 Goal completed!')
  }

  const handleToggleST = (stId, wasDone) => {
    onToggleST(goal.id, stId)
    if (!wasDone) onXP(XP_REWARDS.stDone, '✅ Sub-goal done')
  }

  const submitST = () => {
    if (!stForm.title.trim()) return
    onAddST(goal.id, { id:uid(), ...stForm, done:false })
    setStForm({ title:'', deadline:'' })
    setAdding(false)
  }

  return (
    <Card style={{
      marginBottom:'10px',
      borderLeft:`3px solid ${goal.done ? 'var(--green)' : pct > 50 ? 'var(--gold)' : 'var(--border2)'}`,
    }}>
      <div style={{display:'flex',alignItems:'flex-start',gap:'10px'}}>
        <input type="checkbox" checked={goal.done} onChange={handleToggle} style={{marginTop:'3px'}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap',marginBottom:'4px'}}>
            <span style={{
              fontWeight:700,fontSize:'15px',
              textDecoration:goal.done?'line-through':'none',
              color:goal.done?'var(--text3)':'var(--text)',
            }}>{goal.title}</span>
            {goal.category && <Chip>{goal.category}</Chip>}
          </div>
          {goal.description && <p style={{fontSize:'12px',color:'var(--text2)',marginBottom:'6px',lineHeight:1.5}}>{goal.description}</p>}
          {goal.deadline && <span style={{fontSize:'11px',color:'var(--gold-dim)'}}>📅 {goal.deadline}</span>}
          <div style={{marginTop:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
              <span style={{fontSize:'11px',color:'var(--text3)'}}>
                {stTotal > 0 ? `${stDone}/${stTotal} sub-goals` : 'Progress'}
              </span>
              <span style={{fontSize:'11px',color:pct===100?'var(--green)':'var(--text3)',fontFamily:'var(--mono)',fontWeight:600}}>
                {pct}%
              </span>
            </div>
            <Bar value={pct} max={100} h={5}/>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'5px',flexShrink:0}}>
          {stTotal > 0 && (
            <button onClick={()=>setOpen(o=>!o)} className="pressable" style={{
              padding:'4px',color:'var(--text3)',display:'flex',borderRadius:'6px',
            }}>
              {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
            </button>
          )}
          <button onClick={()=>setAdding(a=>!a)} className="pressable" style={{
            padding:'4px 6px',background:'var(--card2)',border:'1px solid var(--border2)',
            borderRadius:'7px',color:'var(--gold)',display:'flex',alignItems:'center',gap:'2px',fontSize:'11px',fontWeight:600,
          }}>
            <Plus size={12}/>
          </button>
          <button onClick={()=>onDelete(goal.id)} className="pressable" style={{
            padding:'4px',color:'var(--text3)',display:'flex',borderRadius:'6px',
          }}>
            <Trash2 size={14}/>
          </button>
        </div>
      </div>

      {/* Sub-goals */}
      {open && stTotal > 0 && (
        <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
          {goal.shortTerms.map(st => (
            <div key={st.id} style={{
              display:'flex',alignItems:'center',gap:'10px',
              padding:'8px 10px',background:'var(--card2)',
              borderRadius:'8px',marginBottom:'6px',
              borderLeft:`2px solid ${st.done?'var(--green)':'var(--border2)'}`,
            }}>
              <input type="checkbox" checked={st.done} onChange={()=>handleToggleST(st.id,st.done)}/>
              <span style={{flex:1,fontSize:'13px',textDecoration:st.done?'line-through':'none',color:st.done?'var(--text3)':'var(--text)'}}>
                {st.title}
              </span>
              {st.deadline && <span style={{fontSize:'11px',color:'var(--text3)'}}>{st.deadline}</span>}
              <button onClick={()=>onDeleteST(goal.id,st.id)} className="pressable" style={{color:'var(--text3)',display:'flex',padding:'2px'}}>
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline add sub-goal */}
      {adding && (
        <div style={{marginTop:'12px',paddingTop:'12px',borderTop:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:'8px'}}>
          <Input value={stForm.title} onChange={v=>setStForm(f=>({...f,title:v}))} placeholder="Sub-goal title *" autoFocus onKeyDown={e=>e.key==='Enter'&&submitST()}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
            <Input value={stForm.deadline} onChange={v=>setStForm(f=>({...f,deadline:v}))} placeholder="Target date"/>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <Btn size="sm" onClick={submitST}>Add</Btn>
            <Btn size="sm" variant="ghost" onClick={()=>setAdding(false)}>Cancel</Btn>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function GoalsTab({ gameStore }) {
  const [goals, setGoals] = useLocalStorage('momentum_goals_v1', [])
  const [modal, setModal] = useState(false)
  const [filter, setFilter] = useState('active')
  const [form, setForm] = useState({ title:'', description:'', deadline:'', category:'' })

  const addGoal = () => {
    if (!form.title.trim()) return
    setGoals(g => [...g, { id:uid(), ...form, shortTerms:[], done:false, createdAt:new Date().toISOString() }])
    gameStore.updateStats({ goalsCreated: (gameStore.stats.goalsCreated||0) + 1 })
    gameStore.addXP(20, '🎯 New goal created')
    setForm({ title:'', description:'', deadline:'', category:'' })
    setModal(false)
  }

  const toggleGoal = id => setGoals(g => g.map(x => x.id===id ? {...x,done:!x.done} : x))
  const deleteGoal = id => setGoals(g => g.filter(x => x.id!==id))
  const toggleST = (gId,stId) => setGoals(g => g.map(x => x.id===gId ? {...x,shortTerms:x.shortTerms.map(s=>s.id===stId?{...s,done:!s.done}:s)} : x))
  const deleteST = (gId,stId) => setGoals(g => g.map(x => x.id===gId ? {...x,shortTerms:x.shortTerms.filter(s=>s.id!==stId)} : x))
  const addST = (gId,st) => setGoals(g => g.map(x => x.id===gId ? {...x,shortTerms:[...x.shortTerms,st]} : x))

  const filtered = filter==='all' ? goals : filter==='active' ? goals.filter(g=>!g.done) : goals.filter(g=>g.done)

  return (
    <div>
      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginBottom:'20px'}}>
        {[
          { label:'Active', value:goals.filter(g=>!g.done).length, color:'var(--gold)' },
          { label:'Done',   value:goals.filter(g=>g.done).length,  color:'var(--green)' },
          { label:'Sub-goals', value:goals.reduce((a,g)=>a+g.shortTerms.filter(s=>s.done).length,0)+'/'+goals.reduce((a,g)=>a+g.shortTerms.length,0), color:'var(--xp)' },
        ].map(s => (
          <div key={s.label} className="anim-up" style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'12px',textAlign:'center'}}>
            <div style={{fontSize:'20px',fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.value}</div>
            <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'2px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'6px',marginBottom:'16px'}}>
        {['active','all','done'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="pressable" style={{
            padding:'6px 14px', borderRadius:'20px', border:'none', fontSize:'12px',fontWeight:600,
            background:filter===f?'var(--gold)':'var(--card2)',
            color:filter===f?'#000':'var(--text3)',
            transition:'all .15s',
          }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
        <Btn size="sm" onClick={()=>setModal(true)} style={{marginLeft:'auto'}}>
          <Plus size={14}/> Goal
        </Btn>
      </div>

      {filtered.length===0 && (
        <Empty icon="🎯" title={filter==='done'?'No completed goals':'No active goals'} sub={filter==='active'?'Add your first long-term goal to start earning XP.':undefined}/>
      )}

      <div className="stagger">
        {filtered.map(g => (
          <GoalCard key={g.id} goal={g} onToggle={toggleGoal} onToggleST={toggleST}
            onDelete={deleteGoal} onDeleteST={deleteST} onAddST={addST}
            onXP={(amt,reason) => {
              gameStore.addXP(amt, reason)
              const updatedDone = goals.filter(g2=>g2.done).length + 1
              gameStore.updateStats({ goalsDone: updatedDone })
              gameStore.checkBadges({ ...gameStore.stats, goalsDone: updatedDone })
            }}
          />
        ))}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="New Long-Term Goal">
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <Field label="Goal title *">
            <Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="What do you want to achieve?" autoFocus/>
          </Field>
          <Field label="Why does this matter?">
            <Input value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Your reason — this keeps you going" multiline rows={2}/>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <Field label="Category">
              <Select value={form.category} onChange={v=>setForm(f=>({...f,category:v}))}>
                <option value="">None</option>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Target date">
              <Input value={form.deadline} onChange={v=>setForm(f=>({...f,deadline:v}))} placeholder="e.g. Q1 2026"/>
            </Field>
          </div>
          <div style={{background:'var(--xp-soft)',border:'1px solid rgba(124,92,252,.2)',borderRadius:'var(--r-sm)',padding:'10px 12px',fontSize:'12px',color:'var(--xp)'}}>
            🎮 +20 XP for creating · +80 XP when you complete it
          </div>
          <Btn onClick={addGoal} style={{width:'100%'}}>Create Goal</Btn>
        </div>
      </Modal>
    </div>
  )
}
