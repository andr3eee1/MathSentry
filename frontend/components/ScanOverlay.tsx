import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { C, F, indigoShadow, SPRING_CONFIG } from '@/theme';
import { showToast } from '@/components/ToastHelper';

interface ScanOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [viewfinderHeight, setViewfinderHeight] = useState<number>(400);

  // Modal entry animation: fade + scale 1.05 -> 1 spring
  const scale = useSharedValue(1.05);
  const opacity = useSharedValue(0);

  // Scan line animation: loop top 8% -> 92% -> 8% over 2400ms easeInOut infinite
  const scanProgress = useSharedValue(0.08);

  useEffect(() => {
    if (visible) {
      scale.value = 1.05;
      opacity.value = 0;
      scale.value = withSpring(1, SPRING_CONFIG);
      opacity.value = withSpring(1, SPRING_CONFIG);

      scanProgress.value = 0.08;
      scanProgress.value = withRepeat(
        withSequence(
          withTiming(0.92, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.08, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      scale.value = 1.05;
      opacity.value = 0;
    }
  }, [visible]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const scanLineAnimatedStyle = useAnimatedStyle(() => ({
    top: scanProgress.value * viewfinderHeight,
  }));

  const handleShutter = () => {
    onClose();
    showToast('Page captured — running OCR…', 'done');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom,
          },
          overlayAnimatedStyle,
        ]}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>Scan Handwritten Proof</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={20} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Viewfinder */}
        <View
          style={styles.viewfinder}
          onLayout={(e: LayoutChangeEvent) =>
            setViewfinderHeight(e.nativeEvent.layout.height)
          }
        >
          {/* Four Corner Brackets */}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          {/* Animated Scan Line */}
          <Animated.View
            style={[styles.scanLine, indigoShadow, scanLineAnimatedStyle]}
          />
        </View>

        {/* Caption */}
        <Text style={styles.caption}>
          Align the full page inside the frame
        </Text>

        {/* Shutter Button */}
        <View style={styles.shutterContainer}>
          <Pressable
            onPress={handleShutter}
            style={({ pressed }) => [
              styles.shutterButton,
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.slateDeep,
  },
  topRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: C.primary,
    borderTopLeftRadius: 24,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: C.primary,
    borderTopRightRadius: 24,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: C.primary,
    borderBottomLeftRadius: 24,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: C.primary,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: C.primary,
  },
  caption: {
    marginBottom: 24,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: F.ui,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shutterContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  shutterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primary,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
});
