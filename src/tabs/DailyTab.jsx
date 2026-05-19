import { useState, useEffect } from 'react'
import { Plus, Lock, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { uid, todayKey, getDatesAround, isPastDay, formatDate, XP_REWARDS, PRIORITY_COLORS } from '../utils/helpers.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'
import { Btn, Input, Modal, Card, Tip, Field, Bar, Empty, Select } from '../components/UI.jsx'

const BLOCK_LABELS = ['Coding','Content','Design','Writing','Research','Meetings','Admin','Learning','Exercise','Personal','Other']

function DateStrip({ selected, onChange, todos }) {
  const dates = getDatesAround(3, 14)
  const today = todayKey()

  return (
    <div className="scroll-row" style={{marginBottom:'16px'}}>
      {dates.map(d => {
        const dateObj = new Date(d+'T12:00:00')
        const isToday = d===today
        const isSel = d===selected
        const isPast = isPastDay(d)
        const items = todos[d]?.items||[]
        const allDone = items.length>0 && items.every(i=>i.done)
        const hasTasks = items.length>0

        return (
          <button key={d} onClick={()=>onChange(d)} className="pressable" style={{
            flexShrink:0, padding:'8px 10px', borderRadius:'var(--r)',
            border:`1px solid ${isSel?'var(--gold)':isToday?'rgba(240,180,41,.3)':'var(--border)'}`,
            background: isSel ? 'var(--gold-soft)' : 'var(--card)',
            cursor:'pointer', textAlign:'center', minWidth:'52px',
            opacity: isPast && !isToday && !isSel ? 0.6 : 1,
            transition:'all .15s',
          }}>
            <div style={{fontSize:'10px',color:isSel?'var(--gold)':isToday?'var(--gold-dim)':'var(--text3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.3px'}}>
              {dateObj.toLocaleDateString('en',{weekday:'short'})}
            </div>
            <div style={{fontSize:'18px',fontWeight:800,color:isSel?'var(--gold)':'var(--text)',lineHeight:1.2,marginTop:'2px'}}>
              {dateObj.getDate()}
            </div>
            <div style={{height:'5px',display:'flex',justifyContent:'center',marginTop:'3px'}}>
              {allDone && <div style={{width:5,height:5,borderRadius:'50%',background:'var(--green)'}}/>}
              {hasTasks && !allDone && <div style={{width:5,height:5,borderRadius:'50%',background:'var(--gold)',opacity:.6}}/>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function TaskRow({ task, locked, onToggle, onDelete }) {
  const pColor = PRIORITY_COLORS[task.priority] || 'var(--text3)'
  return (
    <div className="anim-up" style={{
      display:'flex',alignItems:'flex-start',gap:'10px',
      padding:'12px 14px',background:'var(--card)',
      border:`1px solid ${task.done?'rgba(34,197,94,.2)':'var(--border)'}`,
      borderRadius:'var(--r)',marginBottom:'8px',
      opacity:task.done?0.65:1,transition:'opacity .2s, border-color .2s',
    }}>
      <button onClick={()=>onToggle(task.id)} className="pressable" style={{
        color:task.done?'var(--green)':'var(--text3)',display:'flex',marginTop:'1px',flexShrink:0,padding:'2px',
      }}>
        {task.done ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{
          fontWeight:600,fontSize:'14px',
          textDecoration:task.done?'line-through':'none',
          color:task.done?'var(--text3)':'var(--text)',
          marginBottom:'5px',lineHeight:1.3,
        }}>
          {task.task}
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
          {task.block && <span style={{fontSize:'11px',color:'var(--gold)',fontWeight:600}}>📦 {task.block}</span>}
          {task.duration && <span style={{fontSize:'11px',color:'var(--text3)'}}>⏱ {task.duration}</span>}
          {task.priority && (
            <span style={{fontSize:'10px',fontWeight:700,color:pColor,background:`${pColor}15`,padding:'1px 6px',borderRadius:'4px'}}>
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>
        {task.notes && <p style={{fontSize:'11px',color:'var(--text3)',marginTop:'5px',lineHeight:1.45}}>{task.notes}</p>}
      </div>
      {locked
        ? <Lock size={12} style={{color:'var(--text3)',marginTop:'4px',flexShrink:0}}/>
        : <button onClick={()=>onDelete(task.id)} className="pressable" style={{color:'var(--text3)',display:'flex',padding:'4px',flexShrink:0}}>
            <Trash2 size={14}/>
          </button>
      }
    </div>
  )
}

export default function DailyTab({ gameStore }) {
  const [todos, setTodos] = useLocalStorage('momentum_todos_v1', {})
  const [selDate, setSelDate] = useState(todayKey())
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ task:'', block:'', duration:'', priority:'medium', notes:'' })

  const locked = isPastDay(selDate)
  const items = todos[selDate]?.items || []
  const doneCount = items.filter(i=>i.done).length
  const isAllDone = items.length>0 && doneCount===items.length

  const addTask = () => {
    if (!form.task.trim()) return
    const existing = todos[selDate] || { items:[] }
    setTodos(t => ({...t,[selDate]:{...existing,items:[...(existing.items||[]),{id:uid(),...form,done:false,createdAt:new Date().toISOString()}]}}))
    setForm({ task:'', block:'', duration:'', priority:'medium', notes:'' })
    setModal(false)
  }

  const toggleTask = (id) => {
    const existing = todos[selDate] || { items:[] }
    const task = existing.items?.find(i=>i.id===id)
    const wasDone = task?.done
    setTodos(t => ({...t,[selDate]:{...existing,items:(existing.items||[]).map(i=>i.id===id?{...i,done:!i.done}:i)}}))

    if (!wasDone) {
      gameStore.addXP(XP_REWARDS.taskDone, '✅ Task done')
      const newDone = doneCount + 1
      const newStats = { ...gameStore.stats, totalDone: (gameStore.stats.totalDone||0)+1 }
      gameStore.updateStats(newStats)
      gameStore.checkBadges(newStats)
      // Check all done bonus
      if (newDone === items.length) {
        setTimeout(() => {
          gameStore.addXP(XP_REWARDS.allTasksDone, '🔥 Day complete!')
        }, 400)
      }
    }
  }

  const deleteTask = (id) => {
    if (locked) return
    const existing = todos[selDate] || { items:[] }
    setTodos(t => ({...t,[selDate]:{...existing,items:(existing.items||[]).filter(i=>i.id!==id)}}))
  }

  const sorted = [...items].sort((a,b) => {
    const o = {high:0,medium:1,low:2}
    return (o[a.priority]??1)-(o[b.priority]??1)
  })

  return (
    <div>
      <DateStrip selected={selDate} onChange={setSelDate} todos={todos}/>

      {/* Day header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'16px',gap:'10px'}}>
        <div>
          <h2 style={{fontSize:'17px',fontWeight:800,color:'var(--text)',lineHeight:1.2,marginBottom:'4px'}}>
            {formatDate(selDate, {weekday:'long',month:'short',day:'numeric'})}
          </h2>
          {locked ? (
            <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'12px',color:'var(--text3)'}}>
              <Lock size={11}/> Locked
            </div>
          ) : items.length > 0 ? (
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <Bar value={doneCount} max={items.length} style={{width:'80px'}}/>
              <span style={{fontSize:'12px',color:'var(--text3)',fontFamily:'var(--mono)'}}>{doneCount}/{items.length}</span>
              {isAllDone && <span style={{fontSize:'12px',color:'var(--green)',fontWeight:700}}>🔥 Done!</span>}
            </div>
          ) : null}
        </div>
        {!locked && <Btn size="sm" onClick={()=>setModal(true)}><Plus size={14}/> Task</Btn>}
      </div>

      {locked && (
        <Tip color="var(--text3)">
          🔒 Past day — tasks are locked to preserve your plan integrity. You can still check them off.
        </Tip>
      )}

      {items.length===0 && (
        <Empty
          icon={locked?'📭':'📋'}
          title={locked?'Nothing was planned here':'Nothing planned yet'}
          sub={!locked?'Add tasks before the day starts — they lock once it passes.':undefined}
        />
      )}

      <div>
        {sorted.map(task => (
          <TaskRow key={task.id} task={task} locked={locked} onToggle={toggleTask} onDelete={deleteTask}/>
        ))}
      </div>

      {/* XP hint */}
      {!locked && items.length===0 && (
        <div style={{marginTop:'16px',padding:'12px 14px',background:'var(--xp-soft)',border:'1px solid rgba(124,92,252,.2)',borderRadius:'var(--r-sm)',fontSize:'12px',color:'var(--xp)'}}>
          🎮 +{XP_REWARDS.taskDone} XP per task · +{XP_REWARDS.allTasksDone} XP bonus for completing all tasks
        </div>
      )}

      <Modal open={modal} onClose={()=>setModal(false)} title="Plan a Task">
        <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
          <Field label="What exactly will you do? *">
            <Input value={form.task} onChange={v=>setForm(f=>({...f,task:v}))} placeholder="Be specific — no vague tasks" autoFocus/>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <Field label="Work block">
              <Select value={form.block} onChange={v=>setForm(f=>({...f,block:v}))}>
                <option value="">None</option>
                {BLOCK_LABELS.map(b=><option key={b} value={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Duration">
              <Input value={form.duration} onChange={v=>setForm(f=>({...f,duration:v}))} placeholder="e.g. 1.5 hrs"/>
            </Field>
          </div>
          <Field label="Priority">
            <div style={{display:'flex',gap:'8px'}}>
              {['low','medium','high'].map(p=>(
                <button key={p} onClick={()=>setForm(f=>({...f,priority:p}))} className="pressable" style={{
                  flex:1,padding:'9px',borderRadius:'8px',border:'none',cursor:'pointer',
                  fontSize:'12px',fontWeight:700,transition:'all .15s',
                  background:form.priority===p ? PRIORITY_COLORS[p] : 'var(--card2)',
                  color:form.priority===p?'#000':'var(--text3)',
                }}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes">
            <Input value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Links, context, details..." multiline rows={2}/>
          </Field>
          <div style={{padding:'10px 12px',background:'rgba(240,180,41,.07)',border:'1px solid rgba(240,180,41,.2)',borderRadius:'var(--r-sm)',fontSize:'12px',color:'var(--gold)'}}>
            ⚠️ Tasks <strong>lock permanently</strong> once this day passes.
          </div>
          <Btn onClick={addTask} style={{width:'100%'}}>Add Task</Btn>
        </div>
      </Modal>
    </div>
  )
}
