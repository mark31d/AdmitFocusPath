// Components/CustomTabBar.js — Floating pill-shaped bottom tab bar
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const { width } = Dimensions.get('window');
const TAB_BAR_H = 64;
const PILL_MARGIN = 20;
const PILL_RADIUS = 32;

const TAB_ICONS = {
  Home: require('../assets/anchor.png'),
  Missions: require('../assets/compass.png'),
  Rewards: require('../assets/star.png'),
  Profile: require('../assets/captain.png'),
};

const TAB_LABELS = {
  Home: 'Home',
  Missions: 'Missions',
  Rewards: 'Rewards',
  Profile: 'Profile',
};

function TabItem({ route, isFocused, onPress, onLongPress, theme }) {
  const scale = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const glowOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1.05 : 0.92,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}>
      {/* gold glow behind active tab */}
      <Animated.View
        style={[
          styles.activeGlow,
          {
            opacity: glowOpacity,
            backgroundColor: 'rgba(242,193,78,0.10)',
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <Image
          source={TAB_ICONS[route.name]}
          style={[
            styles.tabIcon,
            {
              tintColor: isFocused ? theme.gold : 'rgba(255,255,255,0.45)',
            },
          ]}
          resizeMode="contain"
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? theme.gold : 'rgba(255,255,255,0.4)',
              fontWeight: isFocused ? '700' : '500',
            },
          ]}>
          {TAB_LABELS[route.name] || route.name}
        </Text>
      </Animated.View>

      {/* small gold dot indicator */}
      {isFocused && <View style={[styles.dot, { backgroundColor: theme.gold }]} />}
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation, theme }) {
  return (
    <View style={styles.outer}>
      <View style={[styles.pill, { borderColor: `${theme.gold}33` }]}>
        {/* inner subtle gradient overlay */}
        <View style={styles.innerOverlay} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              theme={theme}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    width: width - PILL_MARGIN * 2,
    height: TAB_BAR_H,
    borderRadius: PILL_RADIUS,
    backgroundColor: 'rgba(11,31,51,0.92)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  innerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(242,193,78,0.03)',
    borderRadius: PILL_RADIUS,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  tabIcon: {
    width: 22,
    height: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  dot: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
