import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Check, AlertTriangle, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { api, HistoryItem } from '@/services/api';

interface HistorySheetProps {
  onClose?: () => void;
  onSelectProof?: (id: string) => void;
  refreshTrigger?: number;
}

export const HistorySheet = forwardRef<BottomSheetModal, HistorySheetProps>(
  ({ onClose, onSelectProof, refreshTrigger = 0 }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
      setLoading(true);
      try {
        setItems(await api.getHistory());
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Nu am putut încărca arhiva.');
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadHistory();
    }, [loadHistory, refreshTrigger]);

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
        onChange={(index) => {
          if (index >= 0) loadHistory();
        }}
      >
        <BottomSheetScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => {
              (ref as any)?.current?.dismiss();
              onClose?.();
            }}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Închide"
          >
            <X size={18} color={C.mutedFg} strokeWidth={2} />
          </Pressable>

          <Text style={styles.tag}>ARHIVA DE CONCURS</Text>
          <Text style={styles.title}>Dosare de Audit Recente</Text>

          {loading && items.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : error && items.length === 0 ? (
            <Text style={styles.emptyText}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>
              Nu ai verificat încă nicio demonstrație. Analizele tale vor apărea aici.
            </Text>
          ) : (
            <View>
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
                      styles.statusSquare,
                      item.status === 'ok'
                        ? {
                            backgroundColor: C.successSoft,
                            borderColor: 'rgba(22, 101, 52, 0.3)',
                          }
                        : {
                            backgroundColor: C.flawSoft,
                            borderColor: 'rgba(185, 28, 28, 0.3)',
                          },
                    ]}
                  >
                    {item.status === 'ok' ? (
                      <Check size={14} color={C.success} strokeWidth={2.5} />
                    ) : (
                      <AlertTriangle size={14} color={C.flaw} strokeWidth={2.2} />
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
                        {item.scorePercentage}% ({item.onmScore.toFixed(2)} / 7.00p)
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

HistorySheet.displayName = 'HistorySheet';

const styles = StyleSheet.create({
  emptyText: {
    fontFamily: F.ui,
    fontSize: 13,
    lineHeight: 19,
    color: C.mutedFg,
    paddingVertical: 24,
    textAlign: 'center',
  },
  sheetBackground: {
    backgroundColor: C.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  handle: {
    width: 36,
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
  tag: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.primary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 19,
    color: C.foreground,
    marginBottom: 14,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusSquare: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: F.mathMed,
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
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  metaDot: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  metaScore: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
  },
});
