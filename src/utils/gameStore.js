import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import {
  XP_PER_LEVEL, levelFromXP, BADGES, getLevelTitle, getLevelIcon,
  xpInCurrentLevel
} from './helpers.js'

export function useGameStore() {
  const [xp, setXp] = useLocalStorage('game_xp', 0)
  const [earnedBadges, setEarnedBadges] = useLocalStorage('game_badges', [])
  const [toast, setToast] = useLocalStorage('game_toast', null)
  const [stats, setStats] = useLocalStorage('game_stats', {
    totalDone: 0, goalsCreated: 0, goalsDone: 0, maxStreak: 0,
    scriptsWritten: 0, plansPublished: 0, futureDaysPlanned: 0,
  })

  const level = levelFromXP(xp)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [setToast])

  const addXP = useCallback((amount, reason) => {
    setXp(prev => {
      const oldLevel = levelFromXP(prev)
      const newXP = prev + amount
      const newLevel = levelFromXP(newXP)
      if (newLevel > oldLevel) {
        setTimeout(() => showToast(`🆙 LEVEL UP! You're now ${getLevelIcon(newLevel)} Level ${newLevel} — ${getLevelTitle(newLevel)}`), 300)
      } else if (reason) {
        setTimeout(() => showToast(`+${amount} XP — ${reason}`), 100)
      }
      return newXP
    })
  }, [setXp, showToast])

  const updateStats = useCallback((patch) => {
    setStats(prev => ({ ...prev, ...patch }))
  }, [setStats])

  const checkBadges = useCallback((currentStats) => {
    const fullStats = { ...currentStats, level }
    BADGES.forEach(badge => {
      if (!earnedBadges.includes(badge.id) && badge.check(fullStats)) {
        setEarnedBadges(prev => [...prev, badge.id])
        setTimeout(() => showToast(`🏅 Badge unlocked: ${badge.icon} ${badge.name}!`), 600)
      }
    })
  }, [earnedBadges, level, setEarnedBadges, showToast])

  return {
    xp, level, earnedBadges, toast, stats,
    addXP, updateStats, checkBadges, showToast,
    levelProgress: xpInCurrentLevel(xp),
    xpToNext: XP_PER_LEVEL,
  }
}
