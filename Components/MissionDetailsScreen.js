// Components/MissionDetailsScreen.js — Mission Detail + Completion
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useApp } from './AppContext';

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_BOTTOM_OFFSET = Platform.OS === 'ios' ? 28 : 16;
const TOTAL_TAB_BAR_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_OFFSET;

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
  coin: require('../assets/coin.png'),
  check: require('../assets/check.png'),
  target: require('../assets/target.png'),
  body: require('../assets/body.png'),
  mind: require('../assets/mind.png'),
  book: require('../assets/book.png'),
  star: require('../assets/star.png'),
  anchor: require('../assets/anchor.png'),
  bg: require('../assets/bg.png'),
};

const CATEGORY_ICON = {
  Focus: IMG.target,
  Body: IMG.body,
  Mind: IMG.mind,
  Study: IMG.book,
  Calm: IMG.mind,
};

/* ── sample steps data per mission ── */
const MISSION_STEPS = {
  '1': [
    { id: 's1', text: 'Find a quiet spot', done: true },
    { id: 's2', text: 'Set timer for 5 minutes', done: false },
    { id: 's3', text: 'Breathe in 4s, hold 4s, out 6s', done: false },
  ],
  '2': [
    { id: 's1', text: 'Choose one task to focus on', done: true },
    { id: 's2', text: 'Remove all distractions', done: true },
    { id: 's3', text: 'Work for 25 minutes straight', done: false },
    { id: 's4', text: 'Take a 5-minute break', done: false },
  ],
  '3': [
    { id: 's1', text: 'Pick a book or article', done: false },
    { id: 's2', text: 'Read 10 pages without stopping', done: false },
    { id: 's3', text: 'Write one key takeaway', done: false },
  ],
  default: [
    { id: 's1', text: 'Prepare for the mission', done: false },
    { id: 's2', text: 'Execute the task', done: false },
    { id: 's3', text: 'Log your completion', done: false },
  ],
};

/* ── glass card ── */
function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/* ── difficulty dots ── */
function DifficultyDots({ level = 1 }) {
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

/* ── success modal ── */
function SuccessModal({ visible, onClose, mission, coinsEarned }) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.successOverlay}>
        <Animated.View
          style={[styles.successCard, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successGlow} />

          <View style={styles.successBadge}>
            <Image source={IMG.check} style={styles.successCheckImg} resizeMode="contain" />
          </View>

          <Text style={styles.successTitle}>MISSION COMPLETE</Text>
          <Text style={styles.successMission}>{mission?.title}</Text>
          <View style={styles.successDivider} />

          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <Image source={IMG.coin} style={styles.rewardCoinImg} resizeMode="contain" />
              <Text style={styles.rewardValue}>+{coinsEarned}</Text>
              <Text style={styles.rewardLabel}>Coins</Text>
            </View>
            <View style={styles.rewardSep} />
            <View style={styles.rewardItem}>
              <Image source={IMG.star} style={styles.rewardStarImg} resizeMode="contain" />
              <Text style={styles.rewardValue}>+1</Text>
              <Text style={styles.rewardLabel}>Streak</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.successBtn} activeOpacity={0.7} onPress={onClose}>
            <Text style={styles.successBtnText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ── main screen ── */
export default function MissionDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const {
    missions, completeMission, startMission,
    saveMissionNote, saveQuickLog, saveTimerLog, saveMissionPhoto, missionNotes,
    missionLogs, missionTimerLogs, missionPhotos,
  } = useApp();

  const passedMission = route?.params?.mission;
  const mission = missions.find(m => m.id === passedMission?.id) || passedMission || {
    id: '1', title: 'Sample Mission', desc: 'A demo mission',
    difficulty: 1, coins: 10, time: '5 min', category: 'Focus', status: 'new',
  };

  const initialSteps = (MISSION_STEPS[mission.id] || MISSION_STEPS.default).map(s => ({ ...s }));
  const [steps, setSteps] = useState(initialSteps);
  const [notes, setNotes] = useState(missionNotes[mission.id] || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [completed, setCompleted] = useState(mission.status === 'done');
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [quickLogText, setQuickLogText] = useState('');
  const savedPhoto = missionPhotos[mission.id] || null;
  const [selectedImage, setSelectedImage] = useState(savedPhoto);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [showLogsView, setShowLogsView] = useState(false);
  const timerInterval = useRef(null);

  const savedLogs = missionLogs[mission.id] || [];
  const savedTimerLogs = missionTimerLogs[mission.id] || [];

  // Update selectedImage when missionPhotos changes
  useEffect(() => {
    const savedPhoto = missionPhotos[mission.id] || null;
    setSelectedImage(savedPhoto);
  }, [mission.id, missionPhotos]);

  const allDone = steps.every(s => s.done);
  const doneCount = steps.filter(s => s.done).length;

  const toggleStep = id => {
    setSteps(prev => prev.map(s => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const handleComplete = () => {
    completeMission(mission.id);
    if (notes.trim()) saveMissionNote(mission.id, notes);
    setCompleted(true);
    setShowSuccess(true);
  };

  const handleSaveForLater = () => {
    startMission(mission.id);
    if (notes.trim()) saveMissionNote(mission.id, notes);
    navigation.goBack();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  // Timer functions
  useEffect(() => {
    if (timerRunning) {
      timerInterval.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePhotoProof = () => {
    Alert.alert(
      'Add Photo Proof',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
              },
              (response) => {
                if (response.assets && response.assets[0]) {
                  const photoUri = response.assets[0].uri;
                  setSelectedImage(photoUri);
                  saveMissionPhoto(mission.id, photoUri);
                  Alert.alert('Success', 'Photo selected from camera', [
                    { text: 'OK' },
                  ]);
                } else if (response.didCancel) {
                  console.log('User cancelled camera picker');
                } else if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                }
              }
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
              },
              (response) => {
                if (response.assets && response.assets[0]) {
                  const photoUri = response.assets[0].uri;
                  setSelectedImage(photoUri);
                  saveMissionPhoto(mission.id, photoUri);
                  Alert.alert('Success', 'Photo selected from gallery', [
                    { text: 'OK' },
                  ]);
                } else if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.errorMessage) {
                  Alert.alert('Error', response.errorMessage);
                }
              }
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const handleTimerLog = () => {
    setShowTimerModal(true);
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const handleTimerStart = () => {
    setTimerRunning(true);
  };

  const handleTimerStop = () => {
    setTimerRunning(false);
  };

  const handleTimerReset = () => {
    setTimerSeconds(0);
    setTimerRunning(false);
  };

  const handleTimerSave = () => {
    const timeSpent = formatTime(timerSeconds);
    saveTimerLog(mission.id, timerSeconds);
    Alert.alert('Timer Logged', `Time spent: ${timeSpent}`, [
      { text: 'OK', onPress: () => setShowTimerModal(false) },
    ]);
  };

  const handleQuickLog = () => {
    setShowQuickLogModal(true);
    setQuickLogText('');
    setSelectedDate(new Date());
  };

  const handleQuickLogSave = () => {
    if (quickLogText.trim()) {
      saveQuickLog(mission.id, quickLogText, selectedDate);
      const dateStr = selectedDate.toLocaleDateString();
      const timeStr = selectedDate.toLocaleTimeString();
      Alert.alert('Quick Log Saved', `${quickLogText}\n\nDate: ${dateStr} ${timeStr}`, [
        { text: 'OK', onPress: () => setShowQuickLogModal(false) },
      ]);
    }
  };

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + TOTAL_TAB_BAR_HEIGHT + 250 }]}
        showsVerticalScrollIndicator={false}>
        {/* back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>{'‹'}</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        {/* mission header card */}
        <GlassCard style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.missionIconWrap}>
              <Image
                source={CATEGORY_ICON[mission.category] || IMG.target}
                style={styles.missionIconImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerMeta}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{mission.category || 'Focus'}</Text>
              </View>
              <DifficultyDots level={mission.difficulty || 1} />
            </View>
          </View>

          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDesc}>{mission.desc || 'Complete this mission to earn rewards'}</Text>

          {/* reward info */}
          <View style={styles.rewardInfoRow}>
            <View style={styles.rewardInfoItem}>
              <Image source={IMG.coin} style={styles.rewardInfoCoinImg} resizeMode="contain" />
              <Text style={styles.rewardInfoVal}>{mission.coins || 10} coins</Text>
            </View>
            <View style={styles.rewardInfoSep} />
            <View style={styles.rewardInfoItem}>
              <Text style={styles.rewardInfoVal}>{mission.time || '5 min'}</Text>
            </View>
            <View style={styles.rewardInfoSep} />
            <View style={styles.rewardInfoItem}>
              <Image source={IMG.star} style={styles.rewardInfoStarImg} resizeMode="contain" />
              <Text style={styles.rewardInfoVal}>Artifact chance</Text>
            </View>
          </View>
        </GlassCard>

        {/* steps checklist */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>STEPS</Text>
          <Text style={styles.stepCounter}>{doneCount}/{steps.length}</Text>
        </View>

        <GlassCard style={styles.stepsCard}>
          {steps.map((step, i) => (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepRow, i < steps.length - 1 && styles.stepBorder]}
              activeOpacity={0.6}
              onPress={() => toggleStep(step.id)}>
              <View style={[styles.stepCheck, step.done && styles.stepCheckDone]}>
                {step.done && <Image source={IMG.check} style={styles.stepCheckImg} resizeMode="contain" />}
              </View>
              <Text style={[styles.stepText, step.done && styles.stepTextDone]}>{step.text}</Text>
            </TouchableOpacity>
          ))}
        </GlassCard>

        {/* notes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NOTES</Text>
          <Text style={styles.optionalTag}>Optional</Text>
        </View>

        <GlassCard style={styles.notesCard}>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about this mission..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={true}
          />
        </GlassCard>

        {/* add proof */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ADD PROOF</Text>
          <Text style={styles.optionalTag}>Optional</Text>
        </View>

        <View style={styles.proofRow}>
          <TouchableOpacity
            style={styles.proofBtn}
            activeOpacity={0.7}
            onPress={handlePhotoProof}>
            <Image source={IMG.target} style={styles.proofImg} resizeMode="contain" />
            <Text style={styles.proofLabel}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proofBtn}
            activeOpacity={0.7}
            onPress={handleTimerLog}>
            <Image source={IMG.anchor} style={styles.proofImg} resizeMode="contain" />
            <Text style={styles.proofLabel}>Timer Log</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.proofBtn}
            activeOpacity={0.7}
            onPress={handleQuickLog}>
            <Image source={IMG.book} style={styles.proofImg} resizeMode="contain" />
            <Text style={styles.proofLabel}>Quick Log</Text>
          </TouchableOpacity>
        </View>

        {/* View Saved Proof & Logs */}
        {(savedLogs.length > 0 || savedTimerLogs.length > 0 || selectedImage) && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SAVED PROOF & LOGS</Text>
          </View>
        )}

        {/* Saved Photo Proof */}
        {selectedImage && (
          <View style={styles.savedProofContainer}>
            <View style={styles.savedProofHeader}>
              <Text style={styles.savedProofHeaderTitle}>Photo Proof</Text>
              <Text style={styles.savedProofHeaderDate}>Added: {new Date().toLocaleDateString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.savedProofImageContainer}
              activeOpacity={0.9}
              onPress={() => {
                setViewingImage(selectedImage);
                setShowImageViewer(true);
              }}>
              <Image source={{ uri: selectedImage }} style={styles.savedProofImage} resizeMode="cover" />
            </TouchableOpacity>
          </View>
        )}

        {/* Saved Quick Logs */}
        {savedLogs.map((log) => (
          <View key={log.id} style={styles.savedLogCard}>
            <View style={styles.savedLogIcon}>
              <Image source={IMG.book} style={styles.savedLogIconImg} resizeMode="contain" />
            </View>
            <View style={styles.savedLogContent}>
              <Text style={styles.savedLogText}>{log.text}</Text>
              <Text style={styles.savedLogDate}>
                {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))}

        {/* Saved Timer Logs */}
        {savedTimerLogs.map((log) => {
          const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          };
          return (
            <View key={log.id} style={styles.savedLogCard}>
              <View style={styles.savedLogIcon}>
                <Image source={IMG.anchor} style={styles.savedLogIconImg} resizeMode="contain" />
              </View>
              <View style={styles.savedLogContent}>
                <Text style={styles.savedLogText}>Timer: {formatTime(log.seconds)}</Text>
                <Text style={styles.savedLogDate}>
                  {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* bottom action buttons */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + TOTAL_TAB_BAR_HEIGHT + 20 }]}>
        {completed ? (
          <View style={styles.completedBanner}>
            <Image source={IMG.check} style={styles.completedCheckImg} resizeMode="contain" />
            <Text style={styles.completedText}>Mission Completed</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.completeBtn}
              activeOpacity={0.7}
              onPress={handleComplete}>
              <Text style={styles.completeBtnText}>Complete Mission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7} onPress={handleSaveForLater}>
              <Text style={styles.saveBtnText}>Save for Later</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <SuccessModal
        visible={showSuccess}
        mission={mission}
        coinsEarned={mission.coins || 10}
        onClose={handleSuccessClose}
      />

      {/* Timer Log Modal */}
      <Modal
        visible={showTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.proofModalCard}>
            <Text style={styles.proofModalTitle}>Timer Log</Text>
            <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
            <View style={styles.timerControls}>
              {!timerRunning ? (
                <TouchableOpacity
                  style={[styles.timerBtn, styles.timerBtnStart]}
                  onPress={handleTimerStart}
                  activeOpacity={0.7}>
                  <Text style={styles.timerBtnText}>Start</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.timerBtn, styles.timerBtnStop]}
                  onPress={handleTimerStop}
                  activeOpacity={0.7}>
                  <Text style={styles.timerBtnText}>Stop</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.timerBtn, styles.timerBtnReset]}
                onPress={handleTimerReset}
                activeOpacity={0.7}>
                <Text style={styles.timerBtnText}>Reset</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.proofModalActions}>
              <TouchableOpacity
                style={[styles.proofModalBtn, styles.proofModalBtnSave]}
                onPress={handleTimerSave}
                activeOpacity={0.7}>
                <Text style={styles.proofModalBtnText}>Save Log</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.proofModalBtn, styles.proofModalBtnCancel]}
                onPress={() => setShowTimerModal(false)}
                activeOpacity={0.7}>
                <Text style={[styles.proofModalBtnText, { color: THEME.text2 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Quick Log Modal */}
      <Modal
        visible={showQuickLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickLogModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.proofModalCard}>
            <Text style={styles.proofModalTitle}>Quick Log</Text>

            {/* Date Picker */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.datePickerLabel}>Date & Time:</Text>
              <Text style={styles.datePickerValue}>
                {selectedDate.toLocaleDateString()} {selectedDate.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                textColor={THEME.text}
                themeVariant="dark"
              />
            )}

            <TextInput
              style={styles.quickLogInput}
              placeholder="Enter your log entry..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={quickLogText}
              onChangeText={setQuickLogText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.proofModalActions}>
              <TouchableOpacity
                style={[styles.proofModalBtn, styles.proofModalBtnSave, !quickLogText.trim() && { opacity: 0.5 }]}
                onPress={handleQuickLogSave}
                activeOpacity={0.7}
                disabled={!quickLogText.trim()}>
                <Text style={styles.proofModalBtnText}>Save Log</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.proofModalBtn, styles.proofModalBtnCancel]}
                onPress={() => setShowQuickLogModal(false)}
                activeOpacity={0.7}>
                <Text style={[styles.proofModalBtnText, { color: THEME.text2 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      {showImageViewer && viewingImage && (
        <Modal
          visible={showImageViewer}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowImageViewer(false);
            setViewingImage(null);
          }}>
          <View style={styles.imagePreviewOverlay}>
            <TouchableOpacity
              style={styles.imagePreviewClose}
              onPress={() => {
                setShowImageViewer(false);
                setViewingImage(null);
              }}
              activeOpacity={0.7}>
              <Text style={styles.imagePreviewCloseText}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: viewingImage }} style={styles.previewImage} resizeMode="contain" />
          </View>
        </Modal>
      )}

      {/* Logs Viewer Modal */}
      <Modal
        visible={showLogsView}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLogsView(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.logsViewerCard}>
            <View style={styles.logsViewerHeader}>
              <Text style={styles.logsViewerTitle}>Proof & Logs</Text>
              <TouchableOpacity
                onPress={() => setShowLogsView(false)}
                activeOpacity={0.7}>
                <Text style={styles.logsViewerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.logsViewerContent}>
              {selectedImage && (
                <TouchableOpacity
                  style={styles.logViewerItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    setViewingImage(selectedImage);
                    setShowImageViewer(true);
                    setShowLogsView(false);
                  }}>
                  <Image source={{ uri: selectedImage }} style={styles.logViewerThumbnail} resizeMode="cover" />
                  <View style={styles.logViewerItemContent}>
                    <Text style={styles.logViewerItemTitle}>Photo Proof</Text>
                    <Text style={styles.logViewerItemDate}>Added: {new Date().toLocaleDateString()}</Text>
                  </View>
                </TouchableOpacity>
              )}
              {savedLogs.map((log) => (
                <View key={log.id} style={styles.logViewerItem}>
                  <View style={styles.logViewerIcon}>
                    <Image source={IMG.book} style={styles.logViewerIconImg} resizeMode="contain" />
                  </View>
                  <View style={styles.logViewerItemContent}>
                    <Text style={styles.logViewerItemText}>{log.text}</Text>
                    <Text style={styles.logViewerItemDate}>
                      {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              ))}
              {savedTimerLogs.map((log) => {
                const formatTime = (seconds) => {
                  const mins = Math.floor(seconds / 60);
                  const secs = seconds % 60;
                  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                };
                return (
                  <View key={log.id} style={styles.logViewerItem}>
                    <View style={styles.logViewerIcon}>
                      <Image source={IMG.anchor} style={styles.logViewerIconImg} resizeMode="contain" />
                    </View>
                    <View style={styles.logViewerItemContent}>
                      <Text style={styles.logViewerItemText}>Timer: {formatTime(log.seconds)}</Text>
                      <Text style={styles.logViewerItemDate}>
                        {new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  scroll: { paddingHorizontal: 20 },
  /* back */
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, alignSelf: 'flex-start' },
  backIcon: { fontSize: 28, color: THEME.gold, marginRight: 4, fontWeight: '300', lineHeight: 30 },
  backLabel: { fontSize: 15, color: THEME.gold, fontWeight: '600' },
  /* glass card */
  glassCard: {
    backgroundColor: THEME.card, borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)', padding: 16, marginBottom: 12,
    shadowColor: THEME.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  /* header card */
  headerCard: { paddingVertical: 20, borderColor: 'rgba(242,193,78,0.25)', marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  missionIconWrap: {
    width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 1.5, borderColor: 'rgba(242,193,78,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  missionIconImg: { width: 28, height: 28, tintColor: THEME.gold },
  headerMeta: { alignItems: 'flex-end', gap: 8 },
  categoryBadge: { backgroundColor: 'rgba(242,193,78,0.12)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  categoryText: { fontSize: 11, fontWeight: '700', color: THEME.gold, letterSpacing: 1 },
  dotsRow: { flexDirection: 'row', gap: 4 },
  diffDot: { width: 7, height: 7, borderRadius: 3.5 },
  missionTitle: { fontSize: 24, fontWeight: '800', color: THEME.text, marginBottom: 8, letterSpacing: 0.5 },
  missionDesc: { fontSize: 14, color: THEME.text2, lineHeight: 20, marginBottom: 16 },
  rewardInfoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: 'rgba(242,193,78,0.06)', borderRadius: 14, paddingVertical: 12,
  },
  rewardInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rewardInfoCoinImg: { width: 14, height: 14 },
  rewardInfoStarImg: { width: 14, height: 14, tintColor: THEME.gold },
  rewardInfoVal: { fontSize: 12, color: THEME.text2, fontWeight: '600' },
  rewardInfoSep: { width: 1, height: 16, backgroundColor: 'rgba(242,193,78,0.15)' },
  /* section header */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: THEME.text2, letterSpacing: 2 },
  stepCounter: { fontSize: 13, fontWeight: '700', color: THEME.gold },
  optionalTag: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  /* steps */
  stepsCard: { paddingVertical: 4, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4 },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(242,193,78,0.08)' },
  stepCheck: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    borderColor: 'rgba(242,193,78,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  stepCheckDone: { backgroundColor: THEME.gold, borderColor: THEME.gold },
  stepCheckImg: { width: 14, height: 14, tintColor: THEME.bg },
  stepText: { flex: 1, fontSize: 15, color: THEME.text, fontWeight: '500' },
  stepTextDone: { color: THEME.text2, textDecorationLine: 'line-through' },
  /* notes */
  notesCard: { marginBottom: 16 },
  notesInput: { fontSize: 14, color: THEME.text, minHeight: 80, lineHeight: 20 },
  /* proof */
  proofRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  proofBtn: {
    flex: 1, backgroundColor: THEME.card, borderRadius: 15, borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.12)', paddingVertical: 16, alignItems: 'center',
  },
  proofImg: { width: 22, height: 22, tintColor: THEME.gold, marginBottom: 6 },
  proofLabel: { fontSize: 11, color: THEME.text2, fontWeight: '600' },
  /* bottom bar */
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16,
    backgroundColor: 'rgba(7,18,27,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(242,193,78,0.08)',
  },
  completeBtn: {
    backgroundColor: THEME.gold, paddingVertical: 16, borderRadius: 18, alignItems: 'center', marginBottom: 10,
    shadowColor: THEME.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  completeBtnText: { fontSize: 16, fontWeight: '800', color: THEME.bg, letterSpacing: 1 },
  saveBtn: { borderWidth: 1, borderColor: 'rgba(242,193,78,0.3)', paddingVertical: 13, borderRadius: 18, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: THEME.gold },
  completedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(100,200,100,0.12)', borderWidth: 1, borderColor: 'rgba(100,200,100,0.3)',
    borderRadius: 18, paddingVertical: 16, gap: 10,
  },
  completedCheckImg: { width: 18, height: 18, tintColor: '#7CDB7C' },
  completedText: { fontSize: 16, fontWeight: '700', color: '#7CDB7C' },
  /* success modal */
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  successCard: {
    width: '100%', backgroundColor: THEME.card, borderRadius: 28, borderWidth: 1.5,
    borderColor: 'rgba(242,193,78,0.35)', padding: 32, alignItems: 'center', overflow: 'hidden',
  },
  successGlow: { position: 'absolute', top: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(242,193,78,0.08)' },
  successBadge: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: THEME.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    shadowColor: THEME.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  successCheckImg: { width: 32, height: 32, tintColor: THEME.bg },
  successTitle: { fontSize: 22, fontWeight: '900', color: THEME.gold, letterSpacing: 3, marginBottom: 6, textAlign: 'center' },
  successMission: { fontSize: 15, color: THEME.text2, marginBottom: 20, textAlign: 'center' },
  successDivider: { width: 40, height: 1.5, backgroundColor: 'rgba(242,193,78,0.3)', marginBottom: 20 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, justifyContent: 'center' },
  rewardItem: { alignItems: 'center', paddingHorizontal: 20 },
  rewardCoinImg: { width: 22, height: 22, marginBottom: 4 },
  rewardStarImg: { width: 22, height: 22, marginBottom: 4, tintColor: THEME.gold },
  rewardValue: { fontSize: 20, fontWeight: '800', color: THEME.text, textAlign: 'center' },
  rewardLabel: { fontSize: 12, color: THEME.text2, marginTop: 2, textAlign: 'center' },
  rewardSep: { width: 1, height: 40, backgroundColor: 'rgba(242,193,78,0.2)' },
  successBtn: { width: '100%', backgroundColor: THEME.gold, paddingVertical: 16, borderRadius: 18, alignItems: 'center' },
  successBtnText: { fontSize: 16, fontWeight: '800', color: THEME.bg, letterSpacing: 1 },
  /* proof modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  proofModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: THEME.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.25)',
    padding: 24,
    alignItems: 'center',
  },
  proofModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 20,
    letterSpacing: 1,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '900',
    color: THEME.gold,
    marginBottom: 24,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  timerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  timerBtnStart: {
    backgroundColor: THEME.gold,
  },
  timerBtnStop: {
    backgroundColor: '#E05555',
  },
  timerBtnReset: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.bg,
  },
  quickLogInput: {
    width: '100%',
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    color: THEME.text,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  proofModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  proofModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  proofModalBtnSave: {
    backgroundColor: THEME.gold,
  },
  proofModalBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  proofModalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.bg,
  },
  datePickerButton: {
    width: '100%',
    backgroundColor: THEME.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)',
    padding: 16,
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 12,
    color: THEME.text2,
    marginBottom: 4,
    fontWeight: '600',
  },
  datePickerValue: {
    fontSize: 16,
    color: THEME.gold,
    fontWeight: '700',
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePreviewCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: THEME.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.25)',
    padding: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 15,
    marginBottom: 16,
  },
  closeImageBtn: {
    backgroundColor: THEME.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  closeImageBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.bg,
  },
  /* saved proof & logs */
  savedProofContainer: {
    marginBottom: 16,
  },
  savedProofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedProofHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
  },
  savedProofHeaderDate: {
    fontSize: 11,
    color: THEME.text2,
  },
  savedProofImageContainer: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
  },
  savedProofImage: {
    width: '100%',
    height: 200,
    backgroundColor: THEME.card,
  },
  savedProofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.deep,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  savedProofThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: THEME.card,
  },
  savedProofInfo: {
    flex: 1,
  },
  savedProofTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 4,
  },
  savedProofDate: {
    fontSize: 11,
    color: THEME.text2,
  },
  savedProofArrow: {
    fontSize: 20,
    color: THEME.gold,
    fontWeight: '300',
  },
  savedLogCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.deep,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.2)',
    padding: 14,
    marginBottom: 12,
    width: '100%',
  },
  savedLogIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(242,193,78,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedLogIconImg: {
    width: 20,
    height: 20,
    tintColor: THEME.gold,
  },
  savedLogContent: {
    flex: 1,
  },
  savedLogText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  savedLogDate: {
    fontSize: 11,
    color: THEME.text2,
  },
  savedLogArrow: {
    fontSize: 20,
    color: THEME.gold,
    fontWeight: '300',
  },
});
