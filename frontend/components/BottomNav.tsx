import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from '@/components/Haptics';
import { History, User as UserIcon, Camera } from 'lucide-react-native';
import { C, F } from '@/theme';

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
        { height: 74 + insets.bottom },
      ]}
    >
      <View
        style={[
          styles.contentRow,
          { height: 74 + insets.bottom, paddingBottom: insets.bottom },
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
          <History size={19} color={C.mutedFg} strokeWidth={2} />
          <Text style={styles.tabLabel}>Arhivă</Text>
        </Pressable>

        {/* Center: Direct Camera Shutter Button */}
        <View style={styles.centerColumn}>
          <Pressable
            onPress={handleScanPress}
            accessibilityRole="button"
            accessibilityLabel="Fotografiază demonstrația"
            style={({ pressed }) => [
              styles.scanButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <Camera size={24} color={C.primaryFg} strokeWidth={2} />
          </Pressable>
          <Text style={styles.centerLabel}>Fotografiază</Text>
        </View>

        {/* Right Tab: Profile */}
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [
            styles.sideTab,
            pressed && { opacity: 0.6 },
          ]}
        >
          <UserIcon size={19} color={C.mutedFg} strokeWidth={2} />
          <Text style={styles.tabLabel}>Cont</Text>
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
    backgroundColor: C.card,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 8,
  },
  sideTab: {
    width: 84,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  centerColumn: {
    alignItems: 'center',
  },
  scanButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.slateDeep,
    marginTop: -28,
    borderWidth: 3,
    borderColor: C.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  centerLabel: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.foreground,
    marginTop: 3,
  },
});
