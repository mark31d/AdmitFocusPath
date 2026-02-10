// App.js — AdmiralFocus (MVP: 4 tabs + 1 details, flat imports)

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ---- from /Components (flat only) ----
import Loader from './Components/Loader';
import CustomTabBar from './Components/CustomTabBar';

// ---- main screens (flat) ----
import HomeScreen from './Components/HomeScreen';
import MissionsScreen from './Components/MissionsScreen';
import RewardsScreen from './Components/RewardsScreen';
import ProfileScreen from './Components/ProfileScreen';

// ---- details ----
import MissionDetailsScreen from './Components/MissionDetailsScreen';

// ---- context ----
import { AppProvider } from './Components/AppContext';

// ---- nav instances ----
const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const HomeStack = createNativeStackNavigator();
const MissionsStack = createNativeStackNavigator();
const RewardsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ---- inline theme ----
const THEME = {
  bg: '#07121B',
  card: '#0B1F33',
  deep: '#0E2A45',
  text: '#FFFFFF',
  text2: 'rgba(255,255,255,0.72)',
  line: 'rgba(242,193,78,0.18)',
  gold: '#F2C14E',
  gold2: '#C99A2E',
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: THEME.bg,
    card: THEME.bg,
    text: THEME.text,
    border: THEME.line,
    primary: THEME.gold,
  },
};

// ---- stacks ----
function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="MissionDetails" component={MissionDetailsScreen} />
    </HomeStack.Navigator>
  );
}

function MissionsStackNav() {
  return (
    <MissionsStack.Navigator screenOptions={{ headerShown: false }}>
      <MissionsStack.Screen name="MissionsMain" component={MissionsScreen} />
      <MissionsStack.Screen name="MissionDetails" component={MissionDetailsScreen} />
    </MissionsStack.Navigator>
  );
}

function RewardsStackNav() {
  return (
    <RewardsStack.Navigator screenOptions={{ headerShown: false }}>
      <RewardsStack.Screen name="RewardsMain" component={RewardsScreen} />
    </RewardsStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// ---- tabs ----
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} theme={THEME} />}
    >
      <Tab.Screen name="Home" component={HomeStackNav} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Missions" component={MissionsStackNav} options={{ tabBarLabel: 'Missions' }} />
      <Tab.Screen name="Rewards" component={RewardsStackNav} options={{ tabBarLabel: 'Rewards' }} />
      <Tab.Screen name="Profile" component={ProfileStackNav} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ---- root ----
export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 4000); // Увеличено до 4000ms для более длительного показа
    return () => clearTimeout(t);
  }, []);

  if (booting) return <Loader fullscreen color={THEME.gold} />;

  return (
    <AppProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="Tabs" component={Tabs} />
        </RootStack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export { THEME };
