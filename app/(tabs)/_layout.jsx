import { Tabs } from 'expo-router';
import React from 'react';
import TabBar from '../../components/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="questions"
        options={{ title: 'Questions' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Documentation' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
