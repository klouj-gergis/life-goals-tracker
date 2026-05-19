import { useState } from 'react'
import GoalsTab   from './tabs/GoalsTab.jsx'
import SystemTab  from './tabs/SystemTab.jsx'
import DailyTab   from './tabs/DailyTab.jsx'
import ContentTab from './tabs/ContentTab.jsx'
import InsightsTab from './tabs/InsightsTab.jsx'
import { useGameStore } from './utils/gameStore.js'
import { getLevelIcon, getLevelTitle, levelFromXP, xpInCurrentLevel } from './utils/helpers.js'
import { Toast } from './components/UI.jsx'

const TABS = [
  { id:'goals',   label:'Goals',   icon:'🎯' },
  { id:'system',  label:'System',  icon:'🔄' },
  { id:'daily',   label:'Daily',   icon:'📋' },
  { id:'content', label:'Content', icon:'🎬' },
  { id:'stats',   label:'Stats',   icon:'📊' },
]

export default function App() {
  const [tab, setTab] = useState('daily')
  const gameStore = useGameStore()
  const { xp, level, toast } = gameStore

  const levelPct = Math.round((xpInCurrentLevel(xp) / 100) * 100)

  return (
    <>
      {/* Header */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'rgba(10,10,15,.9)',
        backdropFilter:'blur(12px)',
        borderBottom:'1px solid var(--border)',
        padding:'0 var(--pad)',
      }}>
        <div style={{
          maxWidth:600, margin:'0 auto',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          height:52,
        }}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{
              width:28,height:28,borderRadius:'8px',
              background:'linear-gradient(135deg,var(--gold),#f97316)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'14px',flexShrink:0,
            }}>
              ⚡
            </div>
            <span style={{fontSize:'16px',fontWeight:800,letterSpacing:'-0.3px',color:'var(--text)'}}>
              Momentum
            </span>
          </div>

          {/* Level badge */}
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            {/* XP mini bar */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'2px'}}>
              <div style={{fontSize:'10px',color:'var(--text3)',fontFamily:'var(--mono)',fontWeight:600}}>
                {getLevelIcon(level)} Lv.{level}
              </div>
              <div style={{width:60,height:3,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${levelPct}%`,background:'linear-gradient(90deg,var(--xp),#a78bfa)',borderRadius:2,transition:'width .4s'}}/>
              </div>
            </div>
            <div style={{
              background:'var(--gold-soft)',border:'1px solid rgba(240,180,41,.3)',
              borderRadius:'8px',padding:'4px 10px',
              fontSize:'12px',fontWeight:800,color:'var(--gold)',fontFamily:'var(--mono)',
            }}>
              {xp.toLocaleString()} XP
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{maxWidth:600, margin:'0 auto', padding:'20px var(--pad) 0'}}>
        {tab==='goals'   && <GoalsTab   gameStore={gameStore}/>}
        {tab==='system'  && <SystemTab/>}
        {tab==='daily'   && <DailyTab   gameStore={gameStore}/>}
        {tab==='content' && <ContentTab gameStore={gameStore}/>}
        {tab==='stats'   && <InsightsTab gameStore={gameStore}/>}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0,
        height:'var(--nav-h)',
        background:'rgba(10,10,15,.95)',
        backdropFilter:'blur(16px)',
        borderTop:'1px solid var(--border)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:500,
        paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        <div style={{
          display:'flex', justifyContent:'space-around',
          width:'100%', maxWidth:500, padding:'0 8px',
        }}>
          {TABS.map(t => {
            const active = tab===t.id
            return (
              <button key={t.id} onClick={()=>setTab(t.id)} className="pressable" style={{
                display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
                padding:'8px 12px', borderRadius:'12px', border:'none',
                background: active ? 'var(--gold-soft)' : 'none',
                color: active ? 'var(--gold)' : 'var(--text3)',
                transition:'all .15s', minWidth:56,
              }}>
                <span style={{
                  fontSize:'20px',lineHeight:1,
                  filter: active ? 'none' : 'grayscale(.4)',
                  transition:'transform .15s',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                }}>{t.icon}</span>
                <span style={{
                  fontSize:'10px',fontWeight:active?700:500,
                  letterSpacing:'0.01em',
                  transition:'all .15s',
                }}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Toast notification */}
      <Toast message={toast}/>
    </>
  )
}
