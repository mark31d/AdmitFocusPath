// Components/MissionsScreen.js — Missions List (Tab 2)
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './AppContext';

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
  search: require('../assets/search.png'),
  target: require('../assets/target.png'),
  body: require('../assets/body.png'),
  mind: require('../assets/mind.png'),
  book: require('../assets/book.png'),
  coin: require('../assets/coin.png'),
  anchor: require('../assets/anchor.png'),
  star: require('../assets/star.png'),
  bg: require('../assets/bg.png'),
};

const CATEGORY_ICON = {
  Focus: IMG.target,
  Body: IMG.body,
  Mind: IMG.mind,
  Study: IMG.book,
};

const FILTERS = ['Today', 'Week', 'All'];
const CATEGORIES = ['All', 'Focus', 'Body', 'Mind', 'Study'];

/* ── glass card ── */
function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/* ── difficulty dots ── */
function DifficultyDots({ level }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={[
            styles.diffDot,
            { backgroundColor: i <= level ? THEME.gold : 'rgba(255,255,255,0.15)' },
          ]}
        />
      ))}
    </View>
  );
}

/* ── weekly challenge card ── */
function WeeklyChallengeCard({ daysCompleted }) {
  const progress = daysCompleted / 7;
  return (
    <GlassCard style={styles.challengeCard}>
      <View style={styles.challengeBadge}>
        <Text style={styles.challengeBadgeText}>WEEKLY</Text>
      </View>
      <Text style={styles.challengeTitle}>7-Day Captain Challenge</Text>
      <Text style={styles.challengeDesc}>
        Complete at least 3 missions every day for a week
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{daysCompleted} / 7 days completed</Text>
    </GlassCard>
  );
}

/* ── mission card ── */
function MissionCard({ mission, onPress }) {
  const statusLabel = mission.status === 'done' ? 'Done' : mission.status === 'progress' ? 'Continue' : 'Start';
  const btnStyle = mission.status === 'done' ? styles.btnDone : styles.btnStart;
  const btnTextStyle = mission.status === 'done' ? styles.btnDoneText : styles.btnStartText;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <GlassCard style={styles.missionCard}>
        <View style={styles.missionTop}>
          <View style={styles.missionIconWrap}>
            <Image
              source={CATEGORY_ICON[mission.category] || IMG.target}
              style={styles.missionIconImg}
              resizeMode="contain"
            />
          </View>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionDesc}>{mission.desc}</Text>
          </View>
        </View>

        <View style={styles.missionBottom}>
          <View style={styles.missionMeta}>
            <DifficultyDots level={mission.difficulty} />
            <View style={styles.metaTag}>
              <Image source={IMG.coin} style={styles.metaImg} resizeMode="contain" />
              <Text style={styles.metaText}>{mission.coins} coins</Text>
            </View>
            <Text style={styles.metaText}>{mission.time}</Text>
          </View>
          <TouchableOpacity
            style={[styles.missionBtn, btnStyle]}
            activeOpacity={0.7}
            onPress={onPress}>
            <Text style={[styles.missionBtnText, btnTextStyle]}>{statusLabel}</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

/* ── main screen ── */
export default function MissionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { missions, weeklyChallengeProgress, todayMissions, createMission } = useApp();
  const [activeFilter, setActiveFilter] = useState('Today');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    desc: '',
    category: 'Focus',
    difficulty: 1,
    coins: 10,
    time: '5 min',
  });

  const sourceList = activeFilter === 'Today' ? todayMissions : missions;
  const filtered = sourceList.filter(m => {
    if (activeCategory !== 'All' && m.category !== activeCategory) return false;
    if (searchText && !m.title.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <Image source={IMG.bg} style={styles.bgImage} resizeMode="cover" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>MISSIONS</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.7}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* segmented filter */}
        <View style={styles.segmented}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.segBtn, activeFilter === f && styles.segBtnActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}>
              <Text style={[styles.segText, activeFilter === f && styles.segTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* search */}
        <View style={styles.searchWrap}>
          <Image source={IMG.search} style={styles.searchImg} resizeMode="contain" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search missions..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, activeCategory === c && styles.catChipActive]}
              onPress={() => setActiveCategory(c)}
              activeOpacity={0.7}>
              <Text style={[styles.catChipText, activeCategory === c && styles.catChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <WeeklyChallengeCard daysCompleted={weeklyChallengeProgress} />

        {/* missions list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'Today' ? "TODAY'S MISSIONS" : activeFilter === 'Week' ? 'THIS WEEK' : 'ALL MISSIONS'}
          </Text>
          <Text style={styles.countBadge}>{filtered.length}</Text>
        </View>

        {filtered.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Image source={IMG.anchor} style={styles.emptyImg} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No missions found</Text>
            <Text style={styles.emptyDesc}>Try changing filters or search terms</Text>
          </GlassCard>
        ) : (
          filtered.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              onPress={() => navigation.navigate('MissionDetails', { mission: m })}
            />
          ))
        )}
      </ScrollView>

      {/* Create Mission Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create New Mission</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Mission Title"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newMission.title}
              onChangeText={(text) => setNewMission({ ...newMission, title: text })}
            />

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Description (optional)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={newMission.desc}
              onChangeText={(text) => setNewMission({ ...newMission, desc: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalRow}>
              <View style={styles.modalFull}>
                <Text style={styles.modalLabel}>Category</Text>
                <View style={styles.modalCategoryRow}>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.modalCategoryBtn,
                        newMission.category === cat && styles.modalCategoryBtnActive,
                      ]}
                      onPress={() => setNewMission({ ...newMission, category: cat })}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.modalCategoryText,
                          newMission.category === cat && styles.modalCategoryTextActive,
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={styles.modalFull}>
                <Text style={styles.modalLabel}>Difficulty</Text>
                <View style={styles.modalDifficultyRow}>
                  {[1, 2, 3].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.modalDifficultyBtn,
                        newMission.difficulty === level && styles.modalDifficultyBtnActive,
                      ]}
                      onPress={() => setNewMission({ ...newMission, difficulty: level })}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.modalDifficultyText,
                          newMission.difficulty === level && styles.modalDifficultyTextActive,
                        ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalRow}>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Coins</Text>
                <TextInput
                  style={styles.modalInputSmall}
                  placeholder="10"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newMission.coins.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setNewMission({ ...newMission, coins: num });
                  }}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalHalf}>
                <Text style={styles.modalLabel}>Time</Text>
                <TextInput
                  style={styles.modalInputSmall}
                  placeholder="5 min"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={newMission.time}
                  onChangeText={(text) => setNewMission({ ...newMission, time: text })}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewMission({ title: '', desc: '', category: 'Focus', difficulty: 1, coins: 10, time: '5 min' });
                }}
                activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, !newMission.title.trim() && styles.modalSaveBtnDisabled]}
                onPress={() => {
                  if (!newMission.title.trim()) {
                    Alert.alert('Error', 'Please enter a mission title');
                    return;
                  }
                  createMission(newMission);
                  setShowCreateModal(false);
                  setNewMission({ title: '', desc: '', category: 'Focus', difficulty: 1, coins: 10, time: '5 min' });
                  Alert.alert('Success', 'Mission created!');
                }}
                activeOpacity={0.7}
                disabled={!newMission.title.trim()}>
                <Text style={styles.modalSaveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  bgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  scroll: { paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 28, fontWeight: '900', color: THEME.text, letterSpacing: 4 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addBtnText: { fontSize: 28, fontWeight: '700', color: THEME.bg },
  /* segmented */
  segmented: {
    flexDirection: 'row',
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.12)',
    padding: 4,
    marginBottom: 16,
  },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  segBtnActive: { backgroundColor: 'rgba(242,193,78,0.15)', borderWidth: 1, borderColor: 'rgba(242,193,78,0.3)' },
  segText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  segTextActive: { color: THEME.gold, fontWeight: '700' },
  /* search */
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.1)',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 12,
  },
  searchImg: { width: 18, height: 18, tintColor: 'rgba(255,255,255,0.35)', marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: THEME.text },
  /* category chips */
  chipsScroll: { marginBottom: 16 },
  chipsContent: { gap: 8 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
  },
  catChipActive: { backgroundColor: 'rgba(242,193,78,0.15)', borderColor: 'rgba(242,193,78,0.4)' },
  catChipText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  catChipTextActive: { color: THEME.gold },
  /* weekly challenge */
  challengeCard: { marginBottom: 20, borderColor: 'rgba(242,193,78,0.25)' },
  challengeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(242,193,78,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  challengeBadgeText: { fontSize: 10, fontWeight: '800', color: THEME.gold, letterSpacing: 2 },
  challengeTitle: { fontSize: 18, fontWeight: '800', color: THEME.text, marginBottom: 6 },
  challengeDesc: { fontSize: 13, color: THEME.text2, marginBottom: 14, lineHeight: 18 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(242,193,78,0.12)', overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: THEME.gold },
  progressLabel: { fontSize: 12, color: THEME.text2, fontWeight: '600' },
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
  /* section header */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: THEME.text2, letterSpacing: 2 },
  countBadge: {
    marginLeft: 8, fontSize: 11, fontWeight: '700', color: THEME.gold,
    backgroundColor: 'rgba(242,193,78,0.12)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, overflow: 'hidden',
  },
  /* mission card */
  missionCard: { padding: 14 },
  missionTop: { flexDirection: 'row', marginBottom: 12 },
  missionIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(242,193,78,0.1)', borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  missionIconImg: { width: 22, height: 22, tintColor: THEME.gold },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 3 },
  missionDesc: { fontSize: 12, color: THEME.text2, lineHeight: 17 },
  missionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dotsRow: { flexDirection: 'row', gap: 3 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaImg: { width: 12, height: 12 },
  metaText: { fontSize: 11, color: THEME.text2, fontWeight: '600' },
  /* buttons */
  missionBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 14 },
  btnStart: { backgroundColor: THEME.gold },
  btnDone: { backgroundColor: 'rgba(100,200,100,0.15)', borderWidth: 1, borderColor: 'rgba(100,200,100,0.3)' },
  missionBtnText: { fontSize: 13, fontWeight: '700' },
  btnStartText: { color: THEME.bg },
  btnDoneText: { color: '#7CDB7C' },
  /* empty */
  emptyCard: { alignItems: 'center', paddingVertical: 40 },
  emptyImg: { width: 40, height: 40, tintColor: 'rgba(242,193,78,0.2)', marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: THEME.text, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: THEME.text2 },
  /* create mission modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    padding: 24,
  },
  modalTitle: { fontSize: 24, fontWeight: '800', color: THEME.text, marginBottom: 20, textAlign: 'center' },
  modalInput: {
    backgroundColor: THEME.deep,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 14,
    color: THEME.text,
    fontSize: 16,
    marginBottom: 16,
  },
  modalTextArea: { minHeight: 80, textAlignVertical: 'top' },
  modalRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  modalFull: { flex: 1 },
  modalHalf: { flex: 1 },
  modalLabel: { fontSize: 12, color: THEME.text2, fontWeight: '600', marginBottom: 8 },
  modalInputSmall: {
    backgroundColor: THEME.deep,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 12,
    color: THEME.text,
    fontSize: 14,
  },
  modalCategoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalCategoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCategoryBtnActive: {
    backgroundColor: 'rgba(242,193,78,0.15)',
    borderColor: THEME.gold,
  },
  modalCategoryText: { fontSize: 12, color: THEME.text2, fontWeight: '600' },
  modalCategoryTextActive: { color: THEME.gold },
  modalDifficultyRow: { flexDirection: 'row', gap: 8 },
  modalDifficultyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDifficultyBtnActive: {
    backgroundColor: 'rgba(242,193,78,0.15)',
    borderColor: THEME.gold,
  },
  modalDifficultyText: { fontSize: 16, color: THEME.text2, fontWeight: '700' },
  modalDifficultyTextActive: { color: THEME.gold },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: THEME.deep,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, fontWeight: '700', color: THEME.text2 },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: THEME.gold,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: { opacity: 0.5 },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: THEME.bg },
});
