// Components/HomeScreen.js — Dashboard (Tab 1)
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useApp, statusLabel } from './AppContext';

const { width } = Dimensions.get('window');

const THEME = {
  bg: '#07121B',
  card: '#0B1F33',
  deep: '#0E2A45',
  gold: '#F2C14E',
  gold2: '#C99A2E',
  text: '#FFFFFF',
  text2: 'rgba(255,255,255,0.72)',
  line: 'rgba(242,193,78,0.18)',
  cyan: '#4DD6FF',
};

/* ── assets ── */
const IMG = {
  gear: require('../assets/gear.png'),
  fire: require('../assets/fire.png'),
  check: require('../assets/check.png'),
  coin: require('../assets/coin.png'),
  target: require('../assets/target.png'),
  body: require('../assets/body.png'),
  mind: require('../assets/mind.png'),
  book: require('../assets/book.png'),
  compass: require('../assets/compass.png'),
  anchor: require('../assets/anchor.png'),
  bg: require('../assets/bg.png'),
};

/* ── mission icon map by category ── */
const CATEGORY_ICON = {
  Calm: IMG.mind,
  Focus: IMG.target,
  Study: IMG.book,
  Body: IMG.body,
  Mind: IMG.mind,
};

/* ── week strip labels ── */
const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* ── greeting helper ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ── progress ring using react-native-circular-progress library ── */
function ProgressRing({ progress = 0.5, done = 0, total = 4, size = 180, strokeWidth = 10 }) {
  const normalizedProgress = Math.max(0, Math.min(1, progress));
  const progressPercent = normalizedProgress * 100;
  const innerSize = size - strokeWidth * 2;

  return (
    <View style={[ringStyles.wrap, { width: size, height: size }]}>
      <AnimatedCircularProgress
        size={size}
        width={strokeWidth}
        fill={progressPercent}
        tintColor={THEME.gold}
        backgroundColor="rgba(242,193,78,0.12)"
        rotation={-90}
        lineCap="round"
        duration={0}
        prefill={0}>
        {() => (
          <View
            style={[
              ringStyles.center,
              {
                width: innerSize - 16,
                height: innerSize - 16,
                borderRadius: (innerSize - 16) / 2,
              },
            ]}>
            <Text style={ringStyles.centerBig}>
              {done}/{total}
            </Text>
            <Text style={ringStyles.centerLabel}>Done</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: {
    backgroundColor: THEME.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.1)',
  },
  centerBig: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 1,
  },
  centerLabel: {
    fontSize: 13,
    color: THEME.text2,
    marginTop: 2,
  },
});

/* ── glass card wrapper ── */
function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/* ── status chip ── */
function StatusChip({ label }) {
  const colorMap = {
    New: { bg: 'rgba(77,214,255,0.12)', text: THEME.cyan },
    'In progress': { bg: 'rgba(242,193,78,0.14)', text: THEME.gold },
    Done: { bg: 'rgba(100,200,100,0.14)', text: '#7CDB7C' },
  };
  const c = colorMap[label] || colorMap.New;
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.chipText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

/* ── mission card ── */
function MissionCard({ mission, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <GlassCard style={styles.missionCard}>
        <View style={styles.missionIcon}>
          <Image
            source={CATEGORY_ICON[mission.category] || IMG.target}
            style={styles.missionIconImg}
            resizeMode="contain"
          />
        </View>
        <View style={styles.missionBody}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDesc}>{mission.desc}</Text>
        </View>
        <StatusChip label={statusLabel(mission.status)} />
      </GlassCard>
    </TouchableOpacity>
  );
}

/* ── main screen ── */
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { todayMissions, todayDone, currentStreak, weekStreakData } = useApp();
  const totalMissions = todayMissions.length;
  const progress = totalMissions > 0 ? todayDone / totalMissions : 0;

  return (
    <View style={styles.container}>
      <Image source={IMG.bg} style={styles.bgImage} resizeMode="cover" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.greetingName}>Captain.</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}>
            <Image source={IMG.gear} style={styles.settingsImg} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* progress ring */}
        <View style={styles.ringSection}>
          <ProgressRing progress={progress} done={todayDone} total={totalMissions} size={180} strokeWidth={10} />
          <Text style={styles.ringLabel}>Today's Progress</Text>
        </View>

        {/* streak card */}
        <GlassCard style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Image source={IMG.fire} style={styles.streakImg} resizeMode="contain" />
            <Text style={styles.streakTitle}>Streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}</Text>
          </View>
          <View style={styles.weekStrip}>
            {WEEK_DAYS.map((day, i) => (
              <View key={i} style={styles.weekDay}>
                <View
                  style={[
                    styles.weekDot,
                    {
                      backgroundColor: weekStreakData[i]
                        ? THEME.gold
                        : 'rgba(255,255,255,0.1)',
                    },
                  ]}>
                  {weekStreakData[i] && (
                    <Image source={IMG.check} style={styles.weekCheckImg} resizeMode="contain" />
                  )}
                </View>
                <Text style={styles.weekLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* today's missions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S MISSIONS</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Missions')}
            activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {todayMissions.map(m => (
          <MissionCard
            key={m.id}
            mission={m}
            onPress={() => navigation.navigate('MissionDetails', { mission: m })}
          />
        ))}

        {/* quick actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
        </View>
        <View style={styles.quickRow}>
          {[
            { img: IMG.target, label: 'Start Mission', action: () => navigation.getParent()?.navigate('Missions') },
            { img: IMG.book, label: 'Add Note', action: () => navigation.getParent()?.navigate('Missions') },
            { img: IMG.compass, label: 'View Stats', action: () => navigation.getParent()?.navigate('Profile') },
          ].map((a, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.quickBtn} 
              activeOpacity={0.7}
              onPress={a.action}>
              <View style={styles.quickIconWrap}>
                <Image source={a.img} style={styles.quickImg} resizeMode="contain" />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  bgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  scroll: {
    paddingHorizontal: 20,
  },
  /* header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: THEME.text2,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 1,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,193,78,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsImg: {
    width: 18,
    height: 18,
    tintColor: THEME.gold,
  },
  /* ring section */
  ringSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringLabel: {
    fontSize: 13,
    color: THEME.text2,
    marginTop: 12,
    letterSpacing: 1,
  },
  /* glass card */
  glassCard: {
    backgroundColor: THEME.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    marginBottom: 12,
    shadowColor: THEME.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  /* streak */
  streakCard: {
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  streakImg: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FF4444', // Red color for fire
  },
  streakTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
  },
  weekDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  weekCheckImg: {
    width: 14,
    height: 14,
    tintColor: THEME.bg,
  },
  weekLabel: {
    fontSize: 11,
    color: THEME.text2,
    fontWeight: '600',
  },
  /* section header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text2,
    letterSpacing: 2,
  },
  seeAll: {
    fontSize: 13,
    color: THEME.gold,
    fontWeight: '600',
  },
  /* mission card */
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  missionIconImg: {
    width: 20,
    height: 20,
    tintColor: THEME.gold,
  },
  missionBody: {
    flex: 1,
    marginRight: 10,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 2,
  },
  missionDesc: {
    fontSize: 12,
    color: THEME.text2,
  },
  /* chip */
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  /* quick actions */
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,193,78,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickImg: {
    width: 18,
    height: 18,
    tintColor: THEME.gold,
  },
  quickLabel: {
    fontSize: 11,
    color: THEME.text2,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
