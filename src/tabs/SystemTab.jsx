import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { DAYS, BLOCK_COLORS, BLOCK_TYPES, todayName } from '../utils/helpers.js'
import { useLocalStorage } from '../utils/useLocalStorage.js'
import { Btn, Input, Modal, Card, Tip, Field, ColorDots, Select } from '../components/UI.jsx'

export default function SystemTab() {
  const [system, setSystem] = useLocalStorage('momentum_system_v1', DAYS.map(day=>({day,blocks:[]})))
  const [modal, setModal] = useState(null) // day name
  const [form, setForm] = useState({ label:'', time:'', color:'gold', notes:'', type:'' })
  const [selDay, setSelDay] = useState(todayName())
  const today = todayName()

  const addBlock = () => {
    if (!form.label.trim() && !form.type) return
    const label = form.type || form.label
    setSystem(s => s.map(d => d.day===modal ? {...d,blocks:[...d.blocks,{id:Math.random().toString(36).slice(2),...form,label}]} : d))
    setForm({ label:'', time:'', color:'gold', notes:'', type:'' })
    setModal(null)
  }

  const delBlock = (day,id) => setSystem(s => s.map(d => d.day===day ? {...d,blocks:d.blocks.filter(b=>b.id!==id)} : d))

  const selDayObj = system.find(d=>d.day===selDay)

  return (
    <div>
      <Tip>🔄 These blocks repeat every week — your permanent schedule skeleton.</Tip>

      {/* Day selector - horizontal scroll */}
      <div className="scroll-row" style={{marginBottom:'16px'}}>
        {DAYS.map(day => {
          const dayObj = system.find(d=>d.day===day)
          const count = dayObj?.blocks?.length || 0
          const isToday = day===today
          const isSel = day===selDay
          return (
            <button key={day} onClick={()=>setSelDay(day)} className="pressable" style={{
              flexShrink:0, padding:'10px 14px', borderRadius:'var(--r)',
              border:`1px solid ${isSel?'var(--gold)':isToday?'rgba(240,180,41,.3)':'var(--border)'}`,
              background:isSel?'var(--gold-soft)':'var(--card)',
              cursor:'pointer', textAlign:'center', minWidth:'72px',
              transition:'all .15s',
            }}>
              <div style={{fontSize:'10px',color:isSel?'var(--gold)':isToday?'var(--gold-dim)':'var(--text3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>
                {day.slice(0,3)}
              </div>
              <div style={{
                marginTop:'4px', fontSize:'12px', fontWeight:700,
                color:isSel?'var(--gold)':'var(--text2)',
                fontFamily:'var(--mono)',
              }}>
                {count > 0 ? count : '—'}
              </div>
              {isToday && <div style={{fontSize:'9px',color:'var(--gold)',marginTop:'2px',fontWeight:700}}>TODAY</div>}
            </button>
          )
        })}
      </div>

      {/* Selected day blocks */}
      {selDayObj && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
            <h3 style={{fontSize:'18px',fontWeight:800,color:selDay===today?'var(--gold)':'var(--text)'}}>{selDay}</h3>
            <Btn size="sm" onClick={()=>setModal(selDay)}>
              <Plus size={14}/> Block
            </Btn>
          </div>

          {selDayObj.blocks.length===0 && (
            <div style={{textAlign:'center',padding:'32px 20px',border:'1px dashed var(--border2)',borderRadius:'var(--r)',color:'var(--text3)',fontSize:'13px'}}>
              No blocks — tap + to add your first
            </div>
          )}

          <div className="stagger">
            {selDayObj.blocks.map(block => (
              <div key={block.id} className="anim-up" style={{
                display:'flex',alignItems:'center',gap:'10px',
                padding:'12px 14px',background:'var(--card)',
                borderRadius:'var(--r)',marginBottom:'8px',
                borderLeft:`3px solid ${BLOCK_COLORS[block.color]||'var(--gold)'}`,
                border:`1px solid var(--border)`,
                borderLeftWidth:'3px',
              }}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'14px',fontWeight:600,color:'var(--text)',marginBottom:'3px'}}>{block.label}</div>
                  {block.time && (
                    <div style={{fontSize:'11px',color:'var(--text2)',display:'flex',alignItems:'center',gap:'3px'}}>
                      <Clock size={10}/> {block.time}
                    </div>
                  )}
                  {block.notes && <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'2px'}}>{block.notes}</div>}
                </div>
                <div style={{
                  width:'8px',height:'8px',borderRadius:'50%',
                  background:BLOCK_COLORS[block.color]||'var(--gold)',flexShrink:0,
                }}/>
                <button onClick={()=>delBlock(selDay,block.id)} className="pressable" style={{color:'var(--text3)',display:'flex',padding:'4px'}}>
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All days mini overview */}
      <div style={{marginTop:'24px',paddingTop:'20px',borderTop:'1px solid var(--border)'}}>
        <h3 style={{fontSize:'13px',fontWeight:700,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>
          Weekly Overview
        </h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
          {system.map(d => (
            <div key={d.day} style={{textAlign:'center'}}>
              <div style={{fontSize:'9px',color:d.day===today?'var(--gold)':'var(--text3)',fontWeight:700,textTransform:'uppercase',marginBottom:'4px'}}>
                {d.day.slice(0,1)}
              </div>
              {d.blocks.slice(0,4).map(b=>(
                <div key={b.id} style={{height:'6px',background:BLOCK_COLORS[b.color]||'var(--gold)',borderRadius:'2px',marginBottom:'2px',opacity:.7}}/>
              ))}
              {d.blocks.length===0 && <div style={{height:'6px',background:'var(--border)',borderRadius:'2px'}}/>}
            </div>
          ))}
        </div>
      </div>

      <Modal open={!!modal} onClose={()=>setModal(null)} title={`Add Block — ${modal}`}>
        <div style={{display:'flex',flexDirection:'column',gap:'13px'}}>
          <Field label="Block type">
            <Select value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}>
              <option value="">Custom name ↓</option>
              {BLOCK_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
          {!form.type && (
            <Field label="Custom name">
              <Input value={form.label} onChange={v=>setForm(f=>({...f,label:v}))} placeholder="e.g. Gym, Studio time" autoFocus/>
            </Field>
          )}
          <Field label="Time slot">
            <Input value={form.time} onChange={v=>setForm(f=>({...f,time:v}))} placeholder="e.g. 9:00 – 11:00 AM"/>
          </Field>
          <Field label="Notes">
            <Input value={form.notes} onChange={v=>setForm(f=>({...f,notes:v}))} placeholder="Optional details"/>
          </Field>
          <Field label="Color">
            <ColorDots value={form.color} onChange={v=>setForm(f=>({...f,color:v}))} colors={BLOCK_COLORS}/>
          </Field>
          <Btn onClick={addBlock} style={{width:'100%'}}>Add Block</Btn>
        </div>
      </Modal>
    </div>
  )
}
