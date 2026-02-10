// Components/AppContext.js — Central state management
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const AppContext = createContext();

/* ── all missions (canonical source) ── */
const INITIAL_MISSIONS = [
  { id: '1', title: '5-Minute Breathing', desc: 'Calm your mind with focused breathwork', category: 'Mind', difficulty: 1, coins: 10, time: '5 min' },
  { id: '2', title: 'Focus Sprint (25 min)', desc: 'One task, deep concentration, no distractions', category: 'Focus', difficulty: 2, coins: 25, time: '25 min' },
  { id: '3', title: 'Read 10 Pages', desc: 'Expand your knowledge base daily', category: 'Study', difficulty: 1, coins: 15, time: '15 min' },
  { id: '4', title: 'Walk 2000 Steps', desc: 'Get moving and refresh your body', category: 'Body', difficulty: 1, coins: 15, time: '20 min' },
  { id: '5', title: 'Journaling Session', desc: 'Reflect on your day in 3 key points', category: 'Mind', difficulty: 1, coins: 10, time: '10 min' },
  { id: '6', title: 'Deep Work Block (50 min)', desc: 'Extended focus with short breaks', category: 'Focus', difficulty: 3, coins: 40, time: '50 min' },
  { id: '7', title: 'Stretching Routine', desc: 'Full body stretch to improve mobility', category: 'Body', difficulty: 1, coins: 10, time: '10 min' },
  { id: '8', title: 'Study Flashcards', desc: 'Review 20 flashcards from your deck', category: 'Study', difficulty: 2, coins: 20, time: '15 min' },
];

/* ── helpers ── */
function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayOfWeek(date = new Date()) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Mon=0 … Sun=6
}

/* ── provider ── */
export function AppProvider({ children }) {
  const [missions, setMissions] = useState(
    INITIAL_MISSIONS.map(m => ({ ...m, status: 'new', completedAt: null })),
  );
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [missionNotes, setMissionNotes] = useState({});
  const [missionLogs, setMissionLogs] = useState({});
  const [missionTimerLogs, setMissionTimerLogs] = useState({});
  const [missionPhotos, setMissionPhotos] = useState({});
  const [dailyCompletions, setDailyCompletions] = useState({});
  const [bestStreak, setBestStreak] = useState(0);

  // Refs for synchronous reads inside callbacks
  const missionsRef = useRef(missions);
  const coinsRef = useRef(coins);
  const purchasedRef = useRef(purchasedItems);
  useEffect(() => { missionsRef.current = missions; }, [missions]);
  useEffect(() => { coinsRef.current = coins; }, [coins]);
  useEffect(() => { purchasedRef.current = purchasedItems; }, [purchasedItems]);

  /* ── actions ── */

  const completeMission = useCallback((missionId) => {
    const m = missionsRef.current.find(x => x.id === missionId);
    if (!m || m.status === 'done') return;
    const earned = m.coins;
    setMissions(prev =>
      prev.map(x =>
        x.id === missionId
          ? { ...x, status: 'done', completedAt: new Date().toISOString() }
          : x,
      ),
    );
    setCoins(c => c + earned);
    setXp(x => x + earned * 2);
    setDailyCompletions(dc => {
      const key = getDateKey();
      return { ...dc, [key]: (dc[key] || 0) + 1 };
    });
  }, []);

  const startMission = useCallback((missionId) => {
    setMissions(prev =>
      prev.map(m =>
        m.id === missionId && m.status === 'new'
          ? { ...m, status: 'progress' }
          : m,
      ),
    );
  }, []);

  const saveMissionNote = useCallback((missionId, note) => {
    setMissionNotes(prev => ({ ...prev, [missionId]: note }));
  }, []);

  const saveQuickLog = useCallback((missionId, text, date) => {
    setMissionLogs(prev => ({
      ...prev,
      [missionId]: [
        ...(prev[missionId] || []),
        { id: Date.now().toString(), text, date: date.toISOString() },
      ],
    }));
  }, []);

  const saveTimerLog = useCallback((missionId, seconds) => {
    setMissionTimerLogs(prev => ({
      ...prev,
      [missionId]: [
        ...(prev[missionId] || []),
        { id: Date.now().toString(), seconds, date: new Date().toISOString() },
      ],
    }));
  }, []);

  const saveMissionPhoto = useCallback((missionId, photoUri) => {
    setMissionPhotos(prev => ({
      ...prev,
      [missionId]: photoUri,
    }));
  }, []);

  const purchaseItem = useCallback((itemId, cost) => {
    if (coinsRef.current >= cost && !purchasedRef.current.includes(itemId)) {
      setCoins(c => c - cost);
      setPurchasedItems(prev => [...prev, itemId]);
      return true;
    }
    return false;
  }, []);

  const createMission = useCallback((missionData) => {
    const newMission = {
      id: Date.now().toString(),
      title: missionData.title,
      desc: missionData.desc || '',
      category: missionData.category || 'Focus',
      difficulty: missionData.difficulty || 1,
      coins: missionData.coins || 10,
      time: missionData.time || '5 min',
      status: 'new',
      completedAt: null,
    };
    setMissions(prev => [...prev, newMission]);
    return newMission.id;
  }, []);

  const resetProgress = useCallback(() => {
    setMissions(INITIAL_MISSIONS.map(m => ({ ...m, status: 'new', completedAt: null })));
    setCoins(0);
    setXp(0);
    setPurchasedItems([]);
    setMissionNotes({});
    setMissionLogs({});
    setMissionTimerLogs({});
    setMissionPhotos({});
    setDailyCompletions({});
    setBestStreak(0);
  }, []);

  /* ── computed values ── */

  const getCurrentStreak = () => {
    let streak = 0;
    const today = new Date();
    const todayKey = getDateKey(today);
    const startDay = dailyCompletions[todayKey] > 0 ? 0 : 1;
    for (let i = startDay; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if ((dailyCompletions[getDateKey(d)] || 0) > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getWeekStreakData = () => {
    const today = new Date();
    const dow = getDayOfWeek(today);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      return (dailyCompletions[getDateKey(d)] || 0) > 0;
    });
  };

  const getWeeklyChallengeProgress = () => {
    const today = new Date();
    const dow = getDayOfWeek(today);
    let count = 0;
    for (let i = 0; i <= dow; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      if ((dailyCompletions[getDateKey(d)] || 0) >= 3) count++;
    }
    return count;
  };

  const todayMissions = missions.slice(0, 4);
  const todayDone = todayMissions.filter(m => m.status === 'done').length;
  const totalDone = missions.filter(m => m.status === 'done').length;
  const currentStreak = getCurrentStreak();
  const weekStreakData = getWeekStreakData();
  const weeklyChallengeProgress = getWeeklyChallengeProgress();
  const weeklyRate = Math.round((weekStreakData.filter(Boolean).length / 7) * 100);

  const level = Math.floor(xp / 500) + 1;
  const xpForNextLevel = level * 500;
  const xpInLevel = xp - (level - 1) * 500;

  useEffect(() => {
    if (currentStreak > bestStreak) setBestStreak(currentStreak);
  }, [currentStreak, bestStreak]);

  const value = {
    missions, coins, xp, level, xpForNextLevel, xpInLevel,
    purchasedItems, missionNotes, missionLogs, missionTimerLogs, missionPhotos, dailyCompletions,
    todayMissions, todayDone, totalDone,
    currentStreak, bestStreak: Math.max(bestStreak, currentStreak),
    weekStreakData, weeklyRate, weeklyChallengeProgress,
    completeMission, startMission, saveMissionNote,
    saveQuickLog, saveTimerLog, saveMissionPhoto, purchaseItem, resetProgress, createMission,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/* ── status display helper ── */
export function statusLabel(status) {
  if (status === 'done') return 'Done';
  if (status === 'progress') return 'In progress';
  return 'New';
}
