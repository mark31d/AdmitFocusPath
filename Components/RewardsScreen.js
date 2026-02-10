// Components/RewardsScreen.js — Rewards & Store (Tab 3)
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
  anchor: require('../assets/anchor.png'),
  compass: require('../assets/compass.png'),
  star: require('../assets/star.png'),
  captain: require('../assets/captain.png'),
  coin: require('../assets/coin.png'),
  target: require('../assets/target.png'),
  mind: require('../assets/mind.png'),
  book: require('../assets/book.png'),
  gear: require('../assets/gear.png'),
  check: require('../assets/check.png'),
  bg: require('../assets/bg.png'),
};

const ARTIFACTS = [
  { id: 'anchor', img: IMG.anchor, name: 'Anchor', owned: true },
  { id: 'compass', img: IMG.compass, name: 'Compass', owned: true },
  { id: 'medal', img: IMG.star, name: 'Medal', owned: false },
  { id: 'star', img: IMG.captain, name: 'Star', owned: false },
];

const STORE_ITEMS = [
  { id: 's1', img: IMG.book, name: 'Motivation Card Pack', desc: '10 inspiring captain quotes', cost: 50 },
  { id: 's2', img: IMG.compass, name: 'Theme: Deep Ocean', desc: 'New dark blue color palette', cost: 120 },
  { id: 's3', img: IMG.star, name: "Badge: Captain's Star", desc: 'Exclusive profile badge', cost: 80 },
  { id: 's4', img: IMG.mind, name: 'Focus Soundscape', desc: 'Ocean waves & gentle wind', cost: 60 },
  { id: 's5', img: IMG.gear, name: 'Widget: Mission Timer', desc: 'Home screen timer widget', cost: 100 },
  { id: 's6', img: IMG.anchor, name: "Badge: Admiral's Crest", desc: 'Elite tier profile badge', cost: 200 },
];

/* achievements are computed dynamically from context */

/* ── glass card ── */
function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/* ── main screen ── */
export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const { coins, purchasedItems, purchaseItem, totalDone, bestStreak, level, weeklyRate } = useApp();
  const [modalItem, setModalItem] = useState(null);

  const handleRedeem = (item) => {
    if (item && !purchasedItems.includes(item.id)) {
      const success = purchaseItem(item.id, item.cost);
      if (!success) {
        Alert.alert('Not Enough Coins', 'Complete more missions to earn coins!');
      } else {
        Alert.alert('Success', `${item.name} purchased!`);
      }
      setModalItem(null);
    } else {
      setModalItem(null);
    }
  };

  const ACHIEVEMENTS = [
    { id: 'a1', img: IMG.star, name: 'First Mission', unlocked: totalDone >= 1 },
    { id: 'a2', img: IMG.target, name: '7-Day Streak', unlocked: bestStreak >= 7 },
    { id: 'a3', img: IMG.compass, name: '30 Missions', unlocked: totalDone >= 30 },
    { id: 'a4', img: IMG.mind, name: '5 In One Day', unlocked: totalDone >= 5 },
    { id: 'a5', img: IMG.anchor, name: 'Perfect Week', unlocked: weeklyRate === 100 },
    { id: 'a6', img: IMG.captain, name: 'Admiral Rank', unlocked: level >= 5 },
  ];

  return (
    <View style={styles.container}>
      <Image source={IMG.bg} style={styles.bgImage} resizeMode="cover" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>REWARDS</Text>

        {/* wallet card */}
        <GlassCard style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>ADMIRAL COINS</Text>
              <View style={styles.coinRow}>
                <Image source={IMG.coin} style={styles.coinImg} resizeMode="contain" />
                <Text style={styles.coinAmount}>{coins}</Text>
              </View>
            </View>
            <View style={styles.walletBadge}>
              <Image source={IMG.anchor} style={styles.walletBadgeImg} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.artifactsDivider} />
          <Text style={styles.artifactsLabel}>ARTIFACTS COLLECTED</Text>
          <View style={styles.artifactsRow}>
            {ARTIFACTS.map(a => (
              <View key={a.id} style={[styles.artifactItem, !a.owned && styles.artifactLocked]}>
                <Image
                  source={a.img}
                  style={[styles.artifactImg, !a.owned && styles.artifactImgLocked]}
                  resizeMode="contain"
                />
                <Text style={[styles.artifactName, !a.owned && styles.artifactNameLocked]}>{a.name}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* store */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>REWARD STORE</Text>
        </View>

        <View style={styles.storeGrid}>
          {STORE_ITEMS.map(item => {
            const isRedeemed = purchasedItems.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.storeItemWrap}
                activeOpacity={0.7}
                onPress={() => setModalItem(item)}>
                <GlassCard style={styles.storeCard}>
                  <View style={styles.storeIconWrap}>
                    <Image source={item.img} style={styles.storeImg} resizeMode="contain" />
                    {isRedeemed && (
                      <View style={styles.ownedBadge}>
                        <Image source={IMG.check} style={styles.ownedCheck} resizeMode="contain" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.storeDesc} numberOfLines={2}>{item.desc}</Text>
                  <TouchableOpacity
                    style={[styles.redeemBtn, isRedeemed && styles.redeemBtnDone]}
                    activeOpacity={0.7}
                    onPress={() => setModalItem(item)}>
                    {isRedeemed ? (
                      <Text style={styles.redeemBtnDoneText}>Owned</Text>
                    ) : (
                      <View style={styles.redeemInner}>
                        <Image source={IMG.coin} style={styles.redeemCoinImg} resizeMode="contain" />
                        <Text style={styles.redeemCost}>{item.cost}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* achievements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsRow}>
          {ACHIEVEMENTS.map(ach => (
            <View key={ach.id} style={[styles.achItem, !ach.unlocked && styles.achItemLocked]}>
              <View style={[styles.achCircle, ach.unlocked ? styles.achCircleUnlocked : styles.achCircleLocked]}>
                <Image
                  source={ach.img}
                  style={[styles.achImg, !ach.unlocked && styles.achImgLocked]}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.achName, !ach.unlocked && styles.achNameLocked]} numberOfLines={1}>{ach.name}</Text>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* redeem confirmation modal */}
      <Modal visible={!!modalItem} transparent animationType="fade" onRequestClose={() => setModalItem(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalGlow} />
            <View style={styles.modalIconWrap}>
              {modalItem && <Image source={modalItem.img} style={styles.modalImg} resizeMode="contain" />}
            </View>
            <Text style={styles.modalTitle}>{modalItem?.name}</Text>
            <Text style={styles.modalDesc}>{modalItem?.desc}</Text>
            <View style={styles.modalCostRow}>
              <Text style={styles.modalCostLabel}>Cost:</Text>
              <Image source={IMG.coin} style={styles.modalCostImg} resizeMode="contain" />
              <Text style={styles.modalCostValue}>{modalItem?.cost}</Text>
            </View>
            {modalItem && purchasedItems.includes(modalItem.id) ? (
              <View style={styles.modalOwnedBtn}>
                <Text style={styles.modalOwnedText}>Already Owned</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.modalRedeemBtn} activeOpacity={0.7} onPress={() => handleRedeem(modalItem)}>
                <Text style={styles.modalRedeemText}>Redeem</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.7} onPress={() => setModalItem(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  bgImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  scroll: { paddingHorizontal: 20 },
  screenTitle: { fontSize: 28, fontWeight: '900', color: THEME.text, letterSpacing: 4, marginBottom: 20 },
  glassCard: {
    backgroundColor: THEME.card, borderRadius: 22, borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.15)', padding: 16, marginBottom: 12,
    shadowColor: THEME.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  /* wallet */
  walletCard: { borderColor: 'rgba(242,193,78,0.3)', marginBottom: 24 },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { fontSize: 11, fontWeight: '700', color: THEME.text2, letterSpacing: 2, marginBottom: 6 },
  coinRow: { flexDirection: 'row', alignItems: 'center' },
  coinImg: { width: 24, height: 24, marginRight: 8 },
  coinAmount: { fontSize: 36, fontWeight: '900', color: THEME.gold, letterSpacing: 1 },
  walletBadge: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 1.5, borderColor: 'rgba(242,193,78,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  walletBadgeImg: { width: 26, height: 26, tintColor: THEME.gold },
  artifactsDivider: { height: 1, backgroundColor: 'rgba(242,193,78,0.1)', marginVertical: 16 },
  artifactsLabel: { fontSize: 10, fontWeight: '700', color: THEME.text2, letterSpacing: 2, marginBottom: 12 },
  artifactsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  artifactItem: { alignItems: 'center', flex: 1 },
  artifactLocked: { opacity: 0.45 },
  artifactImg: { width: 28, height: 28, tintColor: THEME.gold, marginBottom: 4 },
  artifactImgLocked: { tintColor: 'rgba(255,255,255,0.3)' },
  artifactName: { fontSize: 11, fontWeight: '600', color: THEME.text2 },
  artifactNameLocked: { color: 'rgba(255,255,255,0.3)' },
  /* section header */
  sectionHeader: { marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: THEME.text2, letterSpacing: 2 },
  /* store grid */
  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  storeItemWrap: { width: CARD_WIDTH },
  storeCard: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12 },
  storeIconWrap: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(242,193,78,0.08)',
    borderWidth: 1, borderColor: 'rgba(242,193,78,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    position: 'relative',
  },
  storeImg: { width: 24, height: 24, tintColor: THEME.gold },
  ownedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7CDB7C',
    borderWidth: 2,
    borderColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedCheck: {
    width: 10,
    height: 10,
    tintColor: '#FFFFFF',
  },
  storeName: { fontSize: 13, fontWeight: '700', color: THEME.text, textAlign: 'center', marginBottom: 4 },
  storeDesc: { fontSize: 11, color: THEME.text2, textAlign: 'center', lineHeight: 15, marginBottom: 12, minHeight: 30 },
  redeemBtn: { backgroundColor: THEME.gold, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 12 },
  redeemBtnDone: { backgroundColor: 'rgba(100,200,100,0.15)', borderWidth: 1, borderColor: 'rgba(100,200,100,0.3)' },
  redeemInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  redeemCoinImg: { width: 12, height: 12 },
  redeemCost: { fontSize: 13, fontWeight: '800', color: THEME.bg },
  redeemBtnDoneText: { fontSize: 12, fontWeight: '700', color: '#7CDB7C' },
  /* achievements */
  achievementsRow: { paddingBottom: 8, gap: 14 },
  achItem: { alignItems: 'center', width: 72 },
  achItemLocked: { opacity: 0.4 },
  achCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  achCircleUnlocked: { backgroundColor: 'rgba(242,193,78,0.12)', borderWidth: 1.5, borderColor: 'rgba(242,193,78,0.4)' },
  achCircleLocked: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  achImg: { width: 22, height: 22, tintColor: THEME.gold },
  achImgLocked: { tintColor: 'rgba(255,255,255,0.3)' },
  achName: { fontSize: 10, fontWeight: '600', color: THEME.text2, textAlign: 'center' },
  achNameLocked: { color: 'rgba(255,255,255,0.3)' },
  /* modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: {
    width: '100%', backgroundColor: THEME.card, borderRadius: 26, borderWidth: 1,
    borderColor: 'rgba(242,193,78,0.25)', padding: 28, alignItems: 'center', overflow: 'hidden',
  },
  modalGlow: { position: 'absolute', top: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(242,193,78,0.08)' },
  modalIconWrap: {
    width: 70, height: 70, borderRadius: 22, backgroundColor: 'rgba(242,193,78,0.1)',
    borderWidth: 1.5, borderColor: 'rgba(242,193,78,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  modalImg: { width: 32, height: 32, tintColor: THEME.gold },
  modalTitle: { fontSize: 20, fontWeight: '800', color: THEME.text, marginBottom: 6 },
  modalDesc: { fontSize: 14, color: THEME.text2, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalCostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 },
  modalCostLabel: { fontSize: 14, color: THEME.text2 },
  modalCostImg: { width: 18, height: 18 },
  modalCostValue: { fontSize: 20, fontWeight: '800', color: THEME.gold },
  modalRedeemBtn: { width: '100%', backgroundColor: THEME.gold, paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  modalRedeemText: { fontSize: 16, fontWeight: '800', color: THEME.bg, letterSpacing: 1 },
  modalOwnedBtn: { width: '100%', backgroundColor: 'rgba(100,200,100,0.15)', borderWidth: 1, borderColor: 'rgba(100,200,100,0.3)', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  modalOwnedText: { fontSize: 16, fontWeight: '800', color: '#7CDB7C', letterSpacing: 1 },
  modalCancelBtn: { width: '100%', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: THEME.text2 },
});
