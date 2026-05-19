import { useMemo } from 'react'
import { useLocalStorage } from '../utils/useLocalStorage.js'
import { todayKey, CONTENT_STATUS, BADGES, getLevelTitle, getLevelIcon, levelFromXP, xpInCurrentLevel } from '../utils/helpers.js'
import { Card, Bar } from '../components/UI.jsx'

function StatCard({ icon, label, value, sub, color='var(--gold)' }) {
  return (
    <Card className="anim-up" style={{textAlign:'center',padding:'14px 12px'}}>
      <div style={{fontSize:'22px',marginBottom:'6px'}}>{icon}</div>
      <div style={{fontSize:'26px',fontWeight:800,color,fontFamily:'var(--mono)',lineHeight:1}}>{value}</div>
      <div style={{fontSize:'12px',color:'var(--text)',fontWeight:600,marginTop:'5px'}}>{label}</div>
      {sub && <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'3px'}}>{sub}</div>}
    </Card>
  )
}

function Heatmap({ todos }) {
  const days = []
  for (let i=27;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i)
    const key = d.toISOString().slice(0,10)
    const items = todos[key]?.items||[]
    const done = items.filter(x=>x.done).length
    const total = items.length
    days.push({key,done,total,d})
  }
  const getC = (done,total) => {
    if (total===0) return 'var(--border)'
    const r = done/total
    if (r===1) return 'var(--green)'
    if (r>=.5) return 'var(--gold)'
    return 'var(--red)'
  }
  return (
    <Card>
      <div style={{fontSize:'12px',fontWeight:700,color:'var(--text2)',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
        28-Day Activity
      </div>
      <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
        {days.map(d=>(
          <div key={d.key} title={`${d.d.toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}: ${d.done}/${d.total}`}
            style={{width:'calc((100% - 108px) / 28)',minWidth:'14px',height:'14px',borderRadius:'3px',background:getC(d.done,d.total),flexShrink:0}}/>
        ))}
      </div>
      <div style={{display:'flex',gap:'8px',marginTop:'10px',alignItems:'center'}}>
        <span style={{fontSize:'10px',color:'var(--text3)'}}>None</span>
        {['var(--border)','var(--red)','var(--gold)','var(--green)'].map((c,i)=>(
          <div key={i} style={{width:12,height:12,borderRadius:'3px',background:c}}/>
        ))}
        <span style={{fontSize:'10px',color:'var(--text3)'}}>All</span>
      </div>
    </Card>
  )
}

function BadgeGrid({ earned }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:'8px'}}>
      {BADGES.map(b=>{
        const isEarned = earned.includes(b.id)
        return (
          <div key={b.id} className={isEarned?'anim-up':''} style={{
            background:isEarned?'var(--gold-soft)':'var(--card2)',
            border:`1px solid ${isEarned?'rgba(240,180,41,.3)':'var(--border)'}`,
            borderRadius:'var(--r)',padding:'12px 8px',textAlign:'center',
            opacity:isEarned?1:.4,
            transition:'all .2s',
          }}>
            <div style={{fontSize:'22px',marginBottom:'6px',filter:isEarned?'none':'grayscale(1)'}}>{b.icon}</div>
            <div style={{fontSize:'11px',fontWeight:700,color:isEarned?'var(--text)':'var(--text3)',marginBottom:'3px'}}>{b.name}</div>
            <div style={{fontSize:'10px',color:'var(--text3)',lineHeight:1.4}}>{b.desc}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function InsightsTab({ gameStore }) {
  const [goals] = useLocalStorage('momentum_goals_v1', [])
  const [todos] = useLocalStorage('momentum_todos_v1', {})
  const [plans] = useLocalStorage('momentum_content_v1', [])

  const { xp, level, earnedBadges, stats } = gameStore
  const today = todayKey()
  const todayItems = todos[today]?.items||[]

  const computed = useMemo(() => {
    const goalsDone = goals.filter(g=>g.done).length
    const stTotal = goals.reduce((a,g)=>a+g.shortTerms.length,0)
    const stDone  = goals.reduce((a,g)=>a+g.shortTerms.filter(s=>s.done).length,0)
    const todayDone = todayItems.filter(i=>i.done).length

    let streak=0
    for (let i=1;i<=60;i++) {
      const d=new Date();d.setDate(d.getDate()-i)
      const key=d.toISOString().slice(0,10)
      const items=todos[key]?.items||[]
      if(items.length>0&&items.every(x=>x.done)) streak++
      else if(items.length>0) break
    }

    const allKeys=Object.keys(todos)
    const totalPlanned=allKeys.reduce((a,k)=>a+(todos[k]?.items?.length||0),0)
    const totalDone=allKeys.reduce((a,k)=>a+(todos[k]?.items?.filter(x=>x.done).length||0),0)
    const published=plans.filter(p=>p.status==='published').length

    return {goalsDone,stTotal,stDone,todayDone,todayTotal:todayItems.length,streak,totalPlanned,totalDone,published}
  }, [goals,todos,plans])

  const overallRate = computed.totalPlanned>0 ? Math.round((computed.totalDone/computed.totalPlanned)*100) : 0
  const levelPct = Math.round((xpInCurrentLevel(xp)/100)*100)

  return (
    <div>
      {/* Player card */}
      <Card glow style={{marginBottom:'20px',background:'linear-gradient(135deg,var(--card) 0%,rgba(124,92,252,.08) 100%)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'14px'}}>
          <div style={{
            width:56,height:56,borderRadius:'50%',
            background:'linear-gradient(135deg,var(--gold),var(--xp))',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'24px',flexShrink:0,
            boxShadow:'0 0 20px rgba(240,180,41,.25)',
          }}>
            {getLevelIcon(level)}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:'13px',color:'var(--text3)',fontWeight:600,marginBottom:'2px',textTransform:'uppercase',letterSpacing:'0.5px'}}>
              Level {level}
            </div>
            <div style={{fontSize:'20px',fontWeight:800,color:'var(--text)',marginBottom:'6px'}}>
              {getLevelTitle(level)}
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{width:`${levelPct}%`}}/>
            </div>
            <div style={{fontSize:'11px',color:'var(--text3)',marginTop:'4px',fontFamily:'var(--mono)'}}>
              {xpInCurrentLevel(xp)} / 100 XP — {100-xpInCurrentLevel(xp)} to next level
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',paddingTop:'12px',borderTop:'1px solid var(--border)'}}>
          {[
            {label:'Total XP', value:xp.toLocaleString(), color:'var(--xp)'},
            {label:'Badges', value:`${earnedBadges.length}/${BADGES.length}`, color:'var(--gold)'},
            {label:'Streak', value:`${computed.streak}d`, color:'var(--green)'},
          ].map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:'16px',fontWeight:800,color:s.color,fontFamily:'var(--mono)'}}>{s.value}</div>
              <div style={{fontSize:'10px',color:'var(--text3)',marginTop:'2px'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',marginBottom:'20px'}}>
        <StatCard icon="🎯" label="Goals Done"    value={computed.goalsDone}    sub={`of ${goals.length}`}  color="var(--gold)"/>
        <StatCard icon="✅" label="Sub-goals"     value={`${computed.stDone}/${computed.stTotal}`} color="var(--green)"/>
        <StatCard icon="📋" label="Today"         value={`${computed.todayDone}/${computed.todayTotal}`} sub={computed.todayTotal===0?'Nothing planned':computed.todayDone===computed.todayTotal&&computed.todayTotal>0?'🎉 Done!':'In progress'} color="var(--blue)"/>
        <StatCard icon="📊" label="All-Time Rate" value={`${overallRate}%`}     sub={`${computed.totalDone}/${computed.totalPlanned}`} color={overallRate>=80?'var(--green)':'var(--gold)'}/>
      </div>

      {/* Heatmap */}
      <div style={{marginBottom:'20px'}}>
        <Heatmap todos={todos}/>
      </div>

      {/* Goals breakdown */}
      {goals.length>0 && (
        <div style={{marginBottom:'20px'}}>
          <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px'}}>Goal Progress</h3>
          {goals.map(g=>{
            const d=g.shortTerms.filter(s=>s.done).length
            const t=g.shortTerms.length
            const pct=t>0?Math.round((d/t)*100):g.done?100:0
            return (
              <div key={g.id} style={{marginBottom:'10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                  <span style={{fontSize:'13px',color:g.done?'var(--text3)':'var(--text)',fontWeight:500,textDecoration:g.done?'line-through':'none'}}>{g.title}</span>
                  <span style={{fontSize:'12px',color:pct===100?'var(--green)':'var(--gold)',fontFamily:'var(--mono)',fontWeight:700}}>{pct}%</span>
                </div>
                <Bar value={pct} max={100} h={5}/>
              </div>
            )
          })}
        </div>
      )}

      {/* Content pipeline */}
      {plans.length>0 && (
        <div style={{marginBottom:'20px'}}>
          <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px'}}>Content Pipeline</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
            {Object.entries(CONTENT_STATUS).map(([k,v])=>{
              const count=plans.filter(p=>p.status===k).length
              return (
                <div key={k} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'10px',textAlign:'center',opacity:count===0?.4:1}}>
                  <div style={{fontSize:'18px',fontWeight:800,color:'var(--text)',fontFamily:'var(--mono)'}}>{count}</div>
                  <div style={{fontSize:'10px',color:'var(--text3)',marginTop:'3px'}}>{v.replace(/^\S+\s/,'')}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      <div style={{marginBottom:'20px'}}>
        <h3 style={{fontSize:'14px',fontWeight:700,color:'var(--text2)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px'}}>
          Badges — {earnedBadges.length}/{BADGES.length}
        </h3>
        <BadgeGrid earned={earnedBadges}/>
      </div>

      {/* Streak card */}
      {computed.streak>=3 && (
        <Card glow style={{textAlign:'center',padding:'20px'}}>
          <div className="anim-float" style={{fontSize:'40px',marginBottom:'10px'}}>
            {computed.streak>=30?'👑':computed.streak>=14?'💎':computed.streak>=7?'🌟':'🔥'}
          </div>
          <div style={{fontSize:'22px',fontWeight:800,color:'var(--gold)',marginBottom:'4px'}}>{computed.streak} day streak</div>
          <div style={{fontSize:'13px',color:'var(--text2)'}}>
            {computed.streak>=30?"You're legendary. Pure discipline."
              :computed.streak>=14?"Two weeks of execution. Keep it up."
              :computed.streak>=7?"A full week done. You're building something real."
              :"You're on a roll. Don't break the chain."}
          </div>
        </Card>
      )}
    </div>
  )
}
