import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// ── Button ───────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant='primary', size='md', style={}, disabled=false }) {
  const base = {
    borderRadius:'10px', fontWeight:600, display:'inline-flex', alignItems:'center',
    justifyContent:'center', gap:'6px', transition:'all .15s', fontFamily:'var(--font)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, letterSpacing:'0.02em', flexShrink:0,
  }
  const V = {
    primary: { background:'var(--gold)', color:'#000' },
    xp:      { background:'var(--xp)', color:'#fff' },
    ghost:   { background:'transparent', color:'var(--text2)', border:'1px solid var(--border2)' },
    danger:  { background:'var(--red-soft)', color:'var(--red)', border:'1px solid rgba(239,68,68,.2)' },
    subtle:  { background:'var(--card2)', color:'var(--text)', border:'1px solid var(--border2)' },
    success: { background:'var(--green-soft)', color:'var(--green)', border:'1px solid rgba(34,197,94,.2)' },
  }
  const S = {
    xs: { padding:'4px 10px', fontSize:'11px', borderRadius:'7px' },
    sm: { padding:'6px 12px', fontSize:'12px' },
    md: { padding:'10px 18px', fontSize:'13px' },
    lg: { padding:'13px 22px', fontSize:'14px' },
  }
  return (
    <button onClick={onClick} disabled={disabled} className="pressable"
      style={{...base,...V[variant],...S[size],...style}}>
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, multiline, rows=3, style={}, autoFocus, onKeyDown, type='text' }) {
  const base = {
    width:'100%', background:'var(--card2)', border:'1px solid var(--border)',
    borderRadius:'10px', color:'var(--text)', padding:'11px 14px',
    fontSize:'14px', outline:'none', resize:'vertical', lineHeight:1.55,
    transition:'border-color .15s', ...style,
  }
  const focus = e => e.target.style.borderColor = 'var(--gold-dim)'
  const blur  = e => e.target.style.borderColor = 'var(--border)'
  const props = { value, onChange:e=>onChange(e.target.value), placeholder, autoFocus, onKeyDown, onFocus:focus, onBlur:blur }
  return multiline
    ? <textarea rows={rows} {...props} style={{...base,resize:'vertical'}} />
    : <input type={type} {...props} style={{...base,resize:undefined}} />
}

// ── Select ───────────────────────────────────────────────────────────
export function Select({ value, onChange, children, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{
      width:'100%', background:'var(--card2)', border:'1px solid var(--border)',
      borderRadius:'10px', color:'var(--text)', padding:'11px 14px',
      fontSize:'14px', outline:'none', cursor:'pointer', ...style,
    }}>{children}</select>
  )
}

// ── Card ─────────────────────────────────────────────────────────────
export function Card({ children, style={}, glow, className='' }) {
  return (
    <div className={`anim-up ${className}`} style={{
      background:'var(--card)', border:`1px solid ${glow ? 'rgba(240,180,41,.25)' : 'var(--border)'}`,
      borderRadius:'var(--r)', padding:'14px',
      boxShadow: glow ? '0 0 20px rgba(240,180,41,.07)' : 'none',
      ...style,
    }}>{children}</div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=520 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.8)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      zIndex:2000, padding:'0',
      backdropFilter:'blur(4px)',
    }}>
      <div onClick={e=>e.stopPropagation()} className="anim-scale" style={{
        background:'var(--surface)', border:'1px solid var(--border2)',
        borderRadius:'var(--r-lg) var(--r-lg) 0 0',
        width:'100%', maxWidth:width, maxHeight:'92dvh', overflow:'auto',
        boxShadow:'0 -20px 60px rgba(0,0,0,.6)',
      }}>
        {/* Drag handle */}
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}>
          <div style={{width:36,height:4,background:'var(--border2)',borderRadius:2}}/>
        </div>
        <div style={{
          padding:'12px 18px 14px', borderBottom:'1px solid var(--border)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          position:'sticky', top:0, background:'var(--surface)', zIndex:1,
        }}>
          <span style={{fontWeight:700, fontSize:'16px', color:'var(--text)'}}>{title}</span>
          <button onClick={onClose} style={{color:'var(--text3)',padding:'4px',display:'flex',borderRadius:'6px'}}>
            <X size={18}/>
          </button>
        </div>
        <div style={{padding:'18px'}}>{children}</div>
      </div>
    </div>
  )
}

// ── Section ──────────────────────────────────────────────────────────
export function Section({ title, children, action, sub }) {
  return (
    <div style={{marginBottom:'28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px',gap:'10px'}}>
        <div>
          <h2 style={{fontSize:'18px',fontWeight:800,color:'var(--text)',letterSpacing:'-0.3px'}}>{title}</h2>
          {sub && <p style={{fontSize:'12px',color:'var(--text3)',marginTop:'2px'}}>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────────
export function Bar({ value, max, color='var(--gold)', h=5, style={} }) {
  const pct = max > 0 ? Math.min(100, Math.round((value/max)*100)) : 0
  return (
    <div style={{height:h, background:'var(--border)', borderRadius:h, overflow:'hidden', ...style}}>
      <div style={{
        height:'100%', width:`${pct}%`,
        background: pct===100 ? 'var(--green)' : color,
        borderRadius:h, transition:'width .4s ease',
      }}/>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────
export function Empty({ icon, title, sub }) {
  return (
    <div style={{
      textAlign:'center', padding:'40px 20px',
      border:'1px dashed var(--border2)', borderRadius:'var(--r)',
      color:'var(--text3)',
    }}>
      {icon && <div style={{fontSize:'32px',marginBottom:'12px'}}>{icon}</div>}
      <div style={{fontSize:'14px',color:'var(--text2)',fontWeight:600,marginBottom:'6px'}}>{title}</div>
      {sub && <div style={{fontSize:'12px'}}>{sub}</div>}
    </div>
  )
}

// ── Tip ───────────────────────────────────────────────────────────────
export function Tip({ children, color='var(--gold)' }) {
  return (
    <div style={{
      padding:'10px 14px', background:`${color}0f`,
      border:`1px solid ${color}25`, borderRadius:'var(--r-sm)',
      fontSize:'12px', color, marginBottom:'16px', lineHeight:1.6,
    }}>{children}</div>
  )
}

// ── Form field ─────────────────────────────────────────────────────
export function Field({ label, hint, children }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'5px'}}>
      {label && <label style={{fontSize:'12px',color:'var(--text2)',fontWeight:600,letterSpacing:'0.02em'}}>{label}</label>}
      {children}
      {hint && <span style={{fontSize:'11px',color:'var(--text3)'}}>{hint}</span>}
    </div>
  )
}

// ── Color dots ────────────────────────────────────────────────────────
export function ColorDots({ value, onChange, colors }) {
  return (
    <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
      {Object.entries(colors).map(([key,hex]) => (
        <button key={key} type="button" onClick={()=>onChange(key)} className="pressable" style={{
          width:24,height:24,borderRadius:'50%',background:hex,
          border: value===key ? '2px solid var(--text)' : '2px solid transparent',
          transition:'transform .1s',
          transform: value===key ? 'scale(1.25)' : 'scale(1)',
        }}/>
      ))}
    </div>
  )
}

// ── Badge chip ────────────────────────────────────────────────────────
export function Chip({ children, color='var(--gold)' }) {
  return (
    <span style={{
      background:`${color}18`, color, border:`1px solid ${color}30`,
      borderRadius:'6px', fontSize:'11px', padding:'2px 8px',
      fontWeight:600, whiteSpace:'nowrap',
    }}>{children}</span>
  )
}

// ── XP Toast ──────────────────────────────────────────────────────────
export function Toast({ message }) {
  if (!message) return null
  return (
    <div className="toast" style={{color:'var(--text)'}}>
      {message}
    </div>
  )
}
