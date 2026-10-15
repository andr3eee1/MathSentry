import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { History, Award, Camera } from 'lucide-react-native';
import { C, F, indigoShadow } from '@/theme';

interface BottomNavProps {
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenScan: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenHistory,
  onOpenProfile,
  onOpenScan,
}) => {
  const insets = useSafeAreaInsets();

  const handleScanPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenScan();
  };

  return (
    <View
      style={[
        styles.absoluteContainer,
        { height: 80 + insets.bottom },
      ]}
    >
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

      <View
        style={[
          styles.contentRow,
          { height: 80 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        {/* Left Tab: History */}
        <Pressable
          onPress={onOpenHistory}
          style={({ pressed }) => [
            styles.sideTab,
            pressed && { opacity: 0.6 },
          ]}
        >
          <History size={20} color={C.mutedFg} strokeWidth={2} />
          <Text style={styles.tabLabel}>History</Text>
        </Pressable>

        {/* Center: Camera Scan Button */}
        <Pressable
          onPress={handleScanPress}
          style={({ pressed }) => [
            styles.scanButton,
            indigoShadow,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Camera size={24} color="#FFFFFF" strokeWidth={2} />
        </Pressable>

        {/* Right Tab: Profile */}
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [
            styles.sideTab,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Award size={20} color={C.mutedFg} strokeWidth={2} />
          <Text style={styles.tabLabel}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    overflow: 'visible',
  },
  contentRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  sideTab: {
    width: 80,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: F.uiMed,
    fontSize: 11,
    color: C.mutedFg,
  },
  scanButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primary,
    marginTop: -32,
    borderWidth: 4,
    borderColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
