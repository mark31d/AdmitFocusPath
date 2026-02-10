// Components/ProfileScreen.js — Profile & Stats (Tab 4)
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from './AppContext';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const IMG = {
  captain: require('../assets/captain.png'),
  target: require('../assets/target.png'),
  compass: require('../assets/compass.png'),
  star: require('../assets/star.png'),
  gear: require('../assets/gear.png'),
  book: require('../assets/book.png'),
  anchor: require('../assets/anchor.png'),
  bg: require('../assets/bg.png'),
  body: require('../assets/body.png'),
  mind: require('../assets/mind.png'),
};

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

/* ── heatmap data (current month) from real completions ── */
function generateHeatmap(dailyCompletions) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const data = [];
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-based
  for (let i = 0; i < startOffset; i++) data.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const count = dailyCompletions[key] || 0;
    const level = count >= 3 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
    data.push({ day: d, level, isToday: d === today.getDate() });
  }
  return { data, monthName: today.toLocaleString('en', { month: 'long' }), year };
}
const WEEK_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* ── settings items ── */
const SETTINGS_ITEMS = [
  { icon: IMG.target, label: 'Notifications', desc: 'Remind me about tasks' },
  { icon: IMG.anchor, label: 'About AdmiralFocus', desc: 'Version 1.0.0' },
  { icon: IMG.star, label: 'Privacy', desc: 'Coming soon' },
];

/* ── glass card ── */
function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/* ── stat mini card ── */
function StatCard({ value, label, icon }) {
  return (
    <GlassCard style={styles.statCard}>
      <Image source={icon} style={styles.statIconImg} resizeMode="contain" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

/* ── heatmap tile ── */
function HeatTile({ data: d }) {
  if (!d) return <View style={styles.heatTile} />;
  const levelColors = [
    'rgba(255,255,255,0.05)', // 0 = nothing
    'rgba(242,193,78,0.2)',   // 1 = low
    'rgba(242,193,78,0.45)',  // 2 = mid
    'rgba(242,193,78,0.8)',   // 3 = high
  ];
  return (
    <View
      style={[
        styles.heatTile,
        {
          backgroundColor: levelColors[d.level],
          borderWidth: d.isToday ? 1.5 : 0,
          borderColor: d.isToday ? THEME.gold : 'transparent',
        },
      ]}>
      <Text
        style={[
          styles.heatDay,
          { color: d.level >= 2 ? THEME.bg : 'rgba(255,255,255,0.5)' },
        ]}>
        {d.day}
      </Text>
    </View>
  );
}

/* ── main screen ── */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { dailyCompletions, weeklyRate, totalDone, bestStreak, level, xp, xpForNextLevel, xpInLevel, resetProgress } = useApp();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showChangeGoalModal, setShowChangeGoalModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('Focus');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [profileName, setProfileName] = useState('Captain');
  const [profileImage, setProfileImage] = useState(null);

  const GOALS = [
    { id: 'Focus', name: 'Focus', desc: 'Build deep concentration habits', icon: IMG.target },
    { id: 'Body', name: 'Body', desc: 'Improve physical health and fitness', icon: IMG.body },
    { id: 'Mind', name: 'Mind', desc: 'Enhance mental clarity and peace', icon: IMG.mind },
    { id: 'Study', name: 'Study', desc: 'Expand knowledge and learning', icon: IMG.book },
  ];

  const HEATMAP = generateHeatmap(dailyCompletions);
  
  // Split heatmap into rows of 7
  const heatRows = [];
  for (let i = 0; i < HEATMAP.data.length; i += 7) {
    heatRows.push(HEATMAP.data.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <Image source={IMG.bg} style={styles.bgImage} resizeMode="cover" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* title */}
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>PROFILE</Text>
         
        </View>

        {/* profile header */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.7}
              onPress={() => setShowEditProfileModal(true)}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImg} resizeMode="cover" />
              ) : (
                <Image source={IMG.captain} style={styles.avatarImg} resizeMode="contain" />
              )}
            </TouchableOpacity>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv {level}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBadge}
              activeOpacity={0.7}
              onPress={() => setShowEditProfileModal(true)}>
              <Text style={styles.editAvatarText}>✎</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowEditProfileModal(true)}>
            <Text style={styles.nickname}>{profileName}</Text>
          </TouchableOpacity>
          <Text style={styles.rank}>Level {level} — Captain</Text>

          {/* xp bar */}
          <View style={styles.xpBarWrap}>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${(xpInLevel / xpForNextLevel) * 100}%` }]} />
            </View>
            <Text style={styles.xpLabel}>{xpInLevel} / {xpForNextLevel} XP to Level {level + 1}</Text>
          </View>
        </GlassCard>

        {/* stats row */}
        <View style={styles.statsRow}>
          <StatCard value={`${weeklyRate}%`} label="Weekly" icon={IMG.target} />
          <StatCard value={totalDone.toString()} label="Total" icon={IMG.compass} />
          <StatCard value={bestStreak.toString()} label="Best Streak" icon={IMG.star} />
        </View>

        {/* heatmap */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {HEATMAP.monthName.toUpperCase()} {HEATMAP.year}
          </Text>
        </View>

        <GlassCard style={styles.heatmapCard}>
          {/* week day headers */}
          <View style={styles.heatRow}>
            {WEEK_HEADERS.map((h, i) => (
              <View key={i} style={styles.heatTile}>
                <Text style={styles.heatHeader}>{h}</Text>
              </View>
            ))}
          </View>
          {/* tiles */}
          {heatRows.map((row, ri) => (
            <View key={ri} style={styles.heatRow}>
              {row.map((d, ci) => (
                <HeatTile key={ci} data={d} />
              ))}
              {/* fill remaining if row < 7 */}
              {row.length < 7 &&
                Array(7 - row.length)
                  .fill(null)
                  .map((_, fi) => <View key={`e${fi}`} style={styles.heatTile} />)}
            </View>
          ))}
          {/* legend */}
          <View style={styles.heatLegend}>
            <Text style={styles.legendLabel}>Less</Text>
            {[0, 1, 2, 3].map(l => (
              <View
                key={l}
                style={[
                  styles.legendTile,
                  {
                    backgroundColor: [
                      'rgba(255,255,255,0.05)',
                      'rgba(242,193,78,0.2)',
                      'rgba(242,193,78,0.45)',
                      'rgba(242,193,78,0.8)',
                    ][l],
                  },
                ]}
              />
            ))}
            <Text style={styles.legendLabel}>More</Text>
          </View>
        </GlassCard>

        {/* current goal */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CURRENT GOAL</Text>
        </View>

        <GlassCard style={styles.goalCard}>
          <View style={styles.goalRow}>
            <View style={styles.goalIconWrap}>
              <Image source={GOALS.find(g => g.id === currentGoal)?.icon || IMG.target} style={styles.goalIconImg} resizeMode="contain" />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{currentGoal}</Text>
              <Text style={styles.goalHint}>
                {GOALS.find(g => g.id === currentGoal)?.desc || 'Build deep concentration habits'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.changeGoalBtn} 
            activeOpacity={0.7}
            onPress={() => setShowChangeGoalModal(true)}>
            <Text style={styles.changeGoalText}>Change Goal</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* settings list (inline) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
        </View>

        {SETTINGS_ITEMS.map((item, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => {
              if (item.label === 'Notifications') setShowNotificationsModal(true);
              else if (item.label === 'Privacy') setShowPrivacyModal(true);
              else if (item.label === 'About AdmiralFocus') setShowAboutModal(true);
            }}>
            <GlassCard style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconWrap}>
                  <Image source={item.icon} style={styles.settingIconImg} resizeMode="contain" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDesc}>{item.desc}</Text>
                </View>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {/* Delete All Data Button */}
        <TouchableOpacity
          style={styles.deleteAllBtn}
          activeOpacity={0.7}
          onPress={() => setResetConfirm(true)}>
          <Text style={styles.deleteAllText}>Delete All Data</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <Text style={styles.modalDesc}>
              Get reminders about your daily tasks
            </Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enable Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: THEME.deep, true: THEME.gold }}
                thumbColor={THEME.text}
              />
            </View>

            {notificationsEnabled && (
              <>
                <Text style={styles.modalLabel}>Reminder Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.7}>
                  <Text style={styles.timePickerValue}>
                    {notificationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={notificationTime}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedTime) => {
                      setShowTimePicker(Platform.OS === 'ios');
                      if (selectedTime) setNotificationTime(selectedTime);
                    }}
                    textColor={THEME.text}
                    themeVariant="dark"
                  />
                )}
              </>
            )}

            <TouchableOpacity
              style={styles.modalSaveBtn}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert('Success', 'Notification settings saved!');
                setShowNotificationsModal(false);
              }}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowNotificationsModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfileModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <View style={styles.profileImageEditContainer}>
              <TouchableOpacity
                style={styles.profileImageEdit}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    'Change Photo',
                    'Choose an option',
                    [
                      {
                        text: 'Camera',
                        onPress: () => {
                          launchCamera(
                            { mediaType: 'photo', quality: 0.8 },
                            (response) => {
                              if (response.assets && response.assets[0]) {
                                setProfileImage(response.assets[0].uri);
                              }
                            }
                          );
                        },
                      },
                      {
                        text: 'Gallery',
                        onPress: () => {
                          launchImageLibrary(
                            { mediaType: 'photo', quality: 0.8 },
                            (response) => {
                              if (response.assets && response.assets[0]) {
                                setProfileImage(response.assets[0].uri);
                              }
                            }
                          );
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImagePreview} resizeMode="cover" />
                ) : (
                  <Image source={IMG.captain} style={styles.profileImagePreviewIcon} resizeMode="contain" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileImageEditBadge}
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    'Change Photo',
                    'Choose an option',
                    [
                      {
                        text: 'Camera',
                        onPress: () => {
                          launchCamera(
                            { mediaType: 'photo', quality: 0.8 },
                            (response) => {
                              if (response.assets && response.assets[0]) {
                                setProfileImage(response.assets[0].uri);
                              }
                            }
                          );
                        },
                      },
                      {
                        text: 'Gallery',
                        onPress: () => {
                          launchImageLibrary(
                            { mediaType: 'photo', quality: 0.8 },
                            (response) => {
                              if (response.assets && response.assets[0]) {
                                setProfileImage(response.assets[0].uri);
                              }
                            }
                          );
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}>
                <Text style={styles.profileImageEditText}>✎</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.profileNameInput}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={profileName}
              onChangeText={setProfileName}
            />

            <TouchableOpacity
              style={styles.modalSaveBtn}
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert('Success', 'Profile updated!');
                setShowEditProfileModal(false);
              }}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowEditProfileModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Privacy</Text>
            <Text style={styles.modalDesc}>
              Coming soon
            </Text>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Goal Modal */}
      <Modal
        visible={showChangeGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChangeGoalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Goal</Text>
            <Text style={styles.modalDesc}>
              Select your current focus goal
            </Text>

            <ScrollView style={styles.goalList} showsVerticalScrollIndicator={false}>
              {GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    currentGoal === goal.id && styles.goalOptionActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setCurrentGoal(goal.id);
                    setShowChangeGoalModal(false);
                    Alert.alert('Success', `Goal changed to ${goal.name}`);
                  }}>
                  <View style={styles.goalOptionIcon}>
                    <Image source={goal.icon} style={styles.goalOptionIconImg} resizeMode="contain" />
                  </View>
                  <View style={styles.goalOptionInfo}>
                    <Text style={styles.goalOptionName}>{goal.name}</Text>
                    <Text style={styles.goalOptionDesc}>{goal.desc}</Text>
                  </View>
                  {currentGoal === goal.id && (
                    <View style={styles.goalOptionCheck}>
                      <Text style={styles.goalOptionCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
d          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAboutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>About AdmiralFocus</Text>
            
            <ScrollView style={styles.aboutScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutDescription}>
                  AdmiralFocus is your personal mission management companion designed to help you stay focused, productive, and achieve your daily goals. Navigate through your tasks like a true captain, track your progress, and earn rewards as you complete missions.
                </Text>

                <Text style={styles.aboutSectionTitle}>Features:</Text>
                <View style={styles.aboutFeatures}>
                  <Text style={styles.aboutFeatureItem}>• Daily mission tracking and progress monitoring</Text>
                  <Text style={styles.aboutFeatureItem}>• Streak system to maintain consistency</Text>
                  <Text style={styles.aboutFeatureItem}>• Reward system with coins and achievements</Text>
                  <Text style={styles.aboutFeatureItem}>• Custom mission creation</Text>
                  <Text style={styles.aboutFeatureItem}>• Photo proof and activity logging</Text>
                  <Text style={styles.aboutFeatureItem}>• Weekly challenges and statistics</Text>
                </View>

                <Text style={styles.aboutSectionTitle}>Mission Categories:</Text>
                <Text style={styles.aboutText}>
                  Focus • Body • Mind • Study
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowAboutModal(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* reset confirmation modal */}
      <Modal
        visible={resetConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setResetConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete All Data?</Text>
            <Text style={styles.modalDesc}>
              This will permanently delete all your missions, streaks, coins, and
              rewards. This action cannot be undone.
            </Text>
            <TouchableOpacity
              style={styles.modalDestructBtn}
              activeOpacity={0.7}
              onPress={() => {
                resetProgress();
                setProfileName('Captain');
                setProfileImage(null);
                setResetConfirm(false);
                Alert.alert('Success', 'All data has been deleted');
              }}>
              <Text style={styles.modalDestructText}>Delete Everything</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.7}
              onPress={() => setResetConfirm(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const TILE_SIZE = (width - 40 - 32 - 6 * 6) / 7; // fit 7 tiles with gaps

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  bgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  scroll: {
    paddingHorizontal: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.text,
    letterSpacing: 4,
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
  settingsBtnImg: {
    width: 18,
    height: 18,
    tintColor: THEME.gold,
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
  /* profile header */
  profileCard: {
    alignItems: 'center',
    paddingVertical: 28,
    marginBottom: 16,
    borderColor: 'rgba(242,193,78,0.25)',
  },
  avatarWrap: {
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(242,193,78,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    tintColor: THEME.gold,
    alignSelf: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: THEME.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.bg,
  },
  nickname: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 1,
  },
  rank: {
    fontSize: 14,
    color: THEME.text2,
    marginTop: 4,
    marginBottom: 16,
  },
  xpBarWrap: {
    width: '80%',
  },
  xpTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(242,193,78,0.12)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: THEME.gold,
  },
  xpLabel: {
    fontSize: 11,
    color: THEME.text2,
    textAlign: 'center',
  },
  /* stats */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statIconImg: {
    width: 18,
    height: 18,
    tintColor: THEME.gold,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.text2,
    fontWeight: '600',
    marginTop: 2,
  },
  /* section header */
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.text2,
    letterSpacing: 2,
  },
  /* heatmap */
  heatmapCard: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  heatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  heatTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.text2,
  },
  heatDay: {
    fontSize: 10,
    fontWeight: '600',
  },
  heatLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  legendTile: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 10,
    color: THEME.text2,
    marginHorizontal: 4,
  },
  /* goal */
  goalCard: {
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalIconImg: {
    width: 22,
    height: 22,
    tintColor: THEME.gold,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.text,
  },
  goalHint: {
    fontSize: 13,
    color: THEME.text2,
    marginTop: 2,
  },
  changeGoalBtn: {
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.3)',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeGoalText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.gold,
  },
  /* data */
  dataRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  dataBtn: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dataBtnIcon: {
    fontSize: 16,
    color: THEME.gold,
    fontWeight: '700',
  },
  dataBtnLabel: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  /* settings */
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    backgroundColor: THEME.card,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(242,193,78,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconImg: {
    width: 16,
    height: 16,
    tintColor: THEME.gold,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
  },
  settingDesc: {
    fontSize: 12,
    color: THEME.text2,
    marginTop: 1,
  },
  settingArrow: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '300',
  },
  /* modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalCard: {
    width: 350,
    maxWidth: 700,
    backgroundColor: THEME.card,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    padding: 28,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 14,
    color: THEME.text2,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalDestructBtn: {
    width: '100%',
    backgroundColor: 'rgba(220,70,70,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(220,70,70,0.4)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalDestructText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E05555',
  },
  modalCancelBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text2,
  },
  /* notifications modal */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
  },
  switchLabel: { fontSize: 16, fontWeight: '600', color: THEME.text },
  modalLabel: { fontSize: 12, color: THEME.text2, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  timePickerButton: {
    backgroundColor: THEME.deep,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    marginBottom: 20,
  },
  timePickerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.gold,
    textAlign: 'center',
  },
  modalSaveBtn: {
    width: '100%',
    backgroundColor: THEME.gold,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: THEME.bg },
  /* edit profile modal */
  profileImageEditContainer: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageEdit: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: THEME.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePreview: {
    width: 100,
    height: 100,
  },
  profileImagePreviewIcon: {
    width: 70,
    height: 70,
    tintColor: THEME.gold,
    alignSelf: 'center',
  },
  profileImageEditBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.card,
    zIndex: 10,
  },
  profileImageEditText: {
    fontSize: 16,
    color: THEME.bg,
    fontWeight: '700',
  },
  profileNameInput: {
    backgroundColor: THEME.deep,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    color: THEME.text,
    fontSize: 16,
    marginBottom: 20,
  },
  /* avatar edit badge */
  editAvatarBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.card,
    zIndex: 10,
  },
  editAvatarText: {
    fontSize: 14,
    color: THEME.bg,
    fontWeight: '700',
  },
  /* delete all button */
  deleteAllBtn: {
    marginTop: 20,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: 'rgba(220,70,70,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220,70,70,0.3)',
    alignItems: 'center',
  },
  deleteAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC4646',
  },
  /* about modal */
  aboutContent: {
    marginBottom: 20,
  },
  aboutVersion: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.gold,
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.text2,
    marginBottom: 24,
    textAlign: 'left',
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginTop: 16,
    marginBottom: 12,
  },
  aboutFeatures: {
    marginBottom: 16,
  },
  aboutFeatureItem: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.text2,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: THEME.text2,
    marginBottom: 8,
  },
  /* change goal modal */
  goalList: {
    maxHeight: 250,
    marginBottom: 20,
    width: '100%',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.deep,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'stretch',
  },
  goalOptionActive: {
    backgroundColor: 'rgba(242,193,78,0.1)',
    borderColor: THEME.gold,
  },
  goalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,193,78,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  goalOptionIconImg: {
    width: 20,
    height: 20,
    tintColor: THEME.gold,
  },
  goalOptionInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
    flexShrink: 1,
    flexGrow: 1,
  },
  goalOptionName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
    flexShrink: 1,
  },
  goalOptionDesc: {
    fontSize: 14,
    color: THEME.text2,
    lineHeight: 20,
  },
  goalOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalOptionCheckText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.bg,
  },
});
