import React from 'react';
import { View } from 'react-native';
import { useAppStore } from '../store/appStore';
import { InspectScreen } from './InspectScreen';

export function PhaseRouter() {
  const { phase } = useAppStore();
  // For this single-screen spec, always render InspectScreen; states drive UI
  return <InspectScreen />;
}
