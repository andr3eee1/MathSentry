import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Check, AlertTriangle, X } from 'lucide-react-native';
import { C, F } from '@/theme';

interface HistorySheetProps {
  onClose?: () => void;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  status: 'ok' | 'flaw';
}

const HISTORY_DATA: HistoryItem[] = [
  {
    id: '1',
    title: 'IMO 2001 P2 — AM-GM chain',
    date: '2 days ago',
    status: 'ok',
  },
  {
    id: '2',
    title: 'Cauchy–Schwarz lemma (USAMO)',
    date: '5 days ago',
    status: 'flaw',
  },
  {
    id: '3',
    title: 'Pigeonhole on residues mod 7',
    date: '1 week ago',
    status: 'ok',
  },
  {
    id: '4',
    title: 'Bernoulli via induction',
    date: 'Today',
    status: 'flaw',
  },
];

export const HistorySheet = forwardRef<BottomSheetModal, HistorySheetProps>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          style={[props.style, { backgroundColor: C.slateDeep }]}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={styles.container}>
          {/* Close button at top right 16 */}
          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onClose?.();
            }}
            hitSlop={8}
            style={styles.closeButton}
          >
            <X size={20} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          <Text style={styles.title}>Past Analyses</Text>

          {/* Rows */}
          {HISTORY_DATA.map((item) => (
            <View key={item.id} style={styles.row}>
              <View
                style={[
                  styles.statusCircle,
                  item.status === 'ok'
                    ? { backgroundColor: C.successSoft }
                    : { backgroundColor: C.flawSoft },
                ]}
              >
                {item.status === 'ok' ? (
                  <Check size={16} color={C.success} strokeWidth={2} />
                ) : (
                  <AlertTriangle size={16} color={C.flaw} strokeWidth={2} />
                )}
              </View>

              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowDate}>{item.date}</Text>
              </View>
            </View>
          ))}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

HistorySheet.displayName = 'HistorySheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
  },
  container: {
    padding: 20,
    position: 'relative',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  title: {
    fontFamily: F.uiSemi,
    fontSize: 16,
    color: C.foreground,
    marginBottom: 12,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: F.math,
    fontSize: 15,
    color: C.foreground,
  },
  rowDate: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
    marginTop: 2,
  },
});
