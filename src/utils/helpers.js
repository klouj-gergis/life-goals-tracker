export const uid = () => Math.random().toString(36).slice(2, 9)

export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export const BLOCK_COLORS = {
  gold:   '#f0b429',
  green:  '#22c55e',
  blue:   '#3b82f6',
  purple: '#7c5cfc',
  pink:   '#ec4899',
  orange: '#f97316',
}

export const CONTENT_STATUS = {
  idea:       '💡 Idea',
  scripting:  '✍️ Scripting',
  shooting:   '🎬 Shooting',
  editing:    '✂️ Editing',
  scheduled:  '📅 Scheduled',
  published:  '✅ Published',
}

export const PLATFORMS = ['YouTube','Instagram','TikTok','Podcast','Blog','Twitter/X','LinkedIn','Other']

export const CATEGORIES = ['Career','Health','Finance','Learning','Creative','Fitness','Personal','Other']

export const BLOCK_TYPES = [
  'Deep Work','Meetings','Email','Exercise','Learning',
  'Content Creation','Review','Planning','Break','Reading'
]

export const PRIORITY_COLORS = { high:'#ef4444', medium:'#f0b429', low:'#22c55e' }

export const todayName = () => {
  const d = new Date().getDay()
  return DAYS[d === 0 ? 6 : d - 1]
}

export const todayKey = () => new Date().toISOString().slice(0, 10)

export const isPastDay = (dateKey) => {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(dateKey + 'T00:00:00'); d.setHours(0,0,0,0)
  return d < today
}

export const formatDate = (dateKey, opts = {}) =>
  new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', {
    weekday:'long', month:'long', day:'numeric', ...opts
  })

export const getDatesAround = (before = 3, after = 14) => {
  const dates = []
  for (let i = -before; i <= after; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

/* ── XP / Leveling ── */
export const XP_PER_LEVEL = 100
export const XP_REWARDS = {
  taskDone:     15,
  allTasksDone: 40,
  goalDone:     80,
  stDone:       25,
  planCreated:  20,
  planPublished:60,
  streak3:      50,
  streak7:      120,
  streak14:     250,
  streak30:     500,
}

export const levelFromXP = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1
export const xpInCurrentLevel = (xp) => xp % XP_PER_LEVEL
export const xpToNextLevel = () => XP_PER_LEVEL

export const LEVEL_TITLES = [
  'Rookie','Focused','Consistent','Dedicated','Disciplined',
  'Sharp','Relentless','Elite','Legendary','Unstoppable'
]
export const getLevelTitle = (level) => LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]

export const LEVEL_ICONS = ['🌱','⚡','🔥','💎','🚀','🌟','🏆','👑','⚔️','🌌']
export const getLevelIcon = (level) => LEVEL_ICONS[Math.min(level - 1, LEVEL_ICONS.length - 1)]

/* ── Badges ── */
export const BADGES = [
  { id:'first_task',   icon:'✅', name:'First Step',     desc:'Complete your first task',          check:(s)=>s.totalDone >= 1 },
  { id:'ten_tasks',    icon:'🔟', name:'Getting Going',  desc:'Complete 10 tasks',                 check:(s)=>s.totalDone >= 10 },
  { id:'50_tasks',     icon:'⚡', name:'On Fire',         desc:'Complete 50 tasks',                 check:(s)=>s.totalDone >= 50 },
  { id:'100_tasks',    icon:'💯', name:'Century',         desc:'Complete 100 tasks',                check:(s)=>s.totalDone >= 100 },
  { id:'first_goal',   icon:'🎯', name:'Aimed',           desc:'Create your first goal',            check:(s)=>s.goalsCreated >= 1 },
  { id:'goal_done',    icon:'🏆', name:'Achieved',        desc:'Complete a long-term goal',         check:(s)=>s.goalsDone >= 1 },
  { id:'streak3',      icon:'🔥', name:'Hot Streak',      desc:'3-day completion streak',           check:(s)=>s.maxStreak >= 3 },
  { id:'streak7',      icon:'🌟', name:'Week Warrior',    desc:'7-day completion streak',           check:(s)=>s.maxStreak >= 7 },
  { id:'streak14',     icon:'💎', name:'Two Weeks',       desc:'14-day completion streak',          check:(s)=>s.maxStreak >= 14 },
  { id:'streak30',     icon:'👑', name:'Legend',          desc:'30-day completion streak',          check:(s)=>s.maxStreak >= 30 },
  { id:'first_script', icon:'✍️', name:'The Writer',      desc:'Write your first full script',      check:(s)=>s.scriptsWritten >= 1 },
  { id:'published',    icon:'🎬', name:'Creator',         desc:'Publish your first video plan',     check:(s)=>s.plansPublished >= 1 },
  { id:'planner',      icon:'📋', name:'Planner',         desc:'Plan 7 days in advance',            check:(s)=>s.futureDaysPlanned >= 7 },
  { id:'level5',       icon:'🚀', name:'Leveled Up',      desc:'Reach Level 5',                     check:(s)=>s.level >= 5 },
  { id:'level10',      icon:'🌌', name:'Ascended',        desc:'Reach Level 10',                    check:(s)=>s.level >= 10 },
]
