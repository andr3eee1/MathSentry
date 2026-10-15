import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Check, AlertTriangle, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { api, HistoryItem } from '@/services/api';

interface HistorySheetProps {
  onClose?: () => void;
  onSelectProof?: (id: string) => void;
}

const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: 'analysis_imo_01',
    title: 'IMO 2001 P2 — AM-GM chain',
    date: '2 days ago',
    status: 'ok',
    scorePercentage: 100,
    onmScore: 7.0,
  },
  {
    id: 'analysis_cauchy_01',
    title: 'Cauchy–Schwarz lemma (USAMO)',
    date: '5 days ago',
    status: 'flaw',
    scorePercentage: 40,
    onmScore: 2.8,
  },
  {
    id: 'analysis_dirichlet_01',
    title: 'Pigeonhole on residues mod 7',
    date: '1 week ago',
    status: 'ok',
    scorePercentage: 100,
    onmScore: 7.0,
  },
  {
    id: 'analysis_bernoulli_01',
    title: 'Bernoulli via induction',
    date: 'Today',
    status: 'flaw',
    scorePercentage: 40,
    onmScore: 2.8,
  },
];

export const HistorySheet = forwardRef<BottomSheetModal, HistorySheetProps>(
  ({ onClose, onSelectProof }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const [items, setItems] = useState<HistoryItem[]>(DEFAULT_HISTORY);
    const [loading, setLoading] = useState<boolean>(false);

    const loadHistory = useCallback(async () => {
      setLoading(true);
      try {
        const data = await api.getHistory();
        if (data && data.length > 0) {
          setItems(data);
        }
      } catch {
        // Fallback to default
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadHistory();
    }, [loadHistory]);

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

    const handleRowPress = (id: string) => {
      onSelectProof?.(id);
      (ref as any)?.current?.dismiss();
      onClose?.();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
        onAnimate={() => loadHistory()}
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

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleRowPress(item.id)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { backgroundColor: C.muted },
                  ]}
                >
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
                    <View style={styles.metaRow}>
                      <Text style={styles.rowDate}>{item.date}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text
                        style={[
                          styles.metaScore,
                          item.status === 'ok'
                            ? { color: C.success }
                            : { color: C.flaw },
                        ]}
                      >
                        {item.scorePercentage}% ({item.onmScore}p)
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
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
    paddingHorizontal: 8,
    borderRadius: 10,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  rowDate: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
  },
  metaDot: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
  },
  metaScore: {
    fontFamily: F.uiMed,
    fontSize: 11,
  },
});
