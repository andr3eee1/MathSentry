import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { FileCode, Copy, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { showToast } from '@/components/ToastHelper';

interface TypstSheetProps {
  onClose?: () => void;
  typstSource?: string;
}

export const TypstSheet = forwardRef<BottomSheetModal, TypstSheetProps>(
  ({ onClose, typstSource }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const activeSource = typstSource || '';

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

    const handleCopy = async () => {
      if (!activeSource) return;
      await Clipboard.setStringAsync(activeSource);
      showToast('Codul sursă Typst a fost copiat.', 'done');
    };

    const renderSyntaxLine = (line: string, index: number) => {
      if (line.startsWith('=')) {
        return (
          <Text key={index} style={styles.lineHeading}>
            {line}
          </Text>
        );
      }

      const regex = /(\$[^\$]+\$)|(#[a-zA-Z0-9_]+)|(\*[^\*]+\*)|("[^"]*")/g;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          elements.push(
            <Text key={`${index}-${lastIndex}`} style={styles.lineDefault}>
              {line.substring(lastIndex, match.index)}
            </Text>
          );
        }

        const token = match[0];
        if (token.startsWith('$')) {
          elements.push(
            <Text key={`${index}-${match.index}`} style={styles.tokenMath}>
              {token}
            </Text>
          );
        } else if (token.startsWith('#')) {
          elements.push(
            <Text key={`${index}-${match.index}`} style={styles.tokenKeyword}>
              {token}
            </Text>
          );
        } else if (token.startsWith('*')) {
          elements.push(
            <Text key={`${index}-${match.index}`} style={styles.tokenBold}>
              {token}
            </Text>
          );
        } else if (token.startsWith('"')) {
          elements.push(
            <Text key={`${index}-${match.index}`} style={styles.tokenString}>
              {token}
            </Text>
          );
        }
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < line.length) {
        elements.push(
          <Text key={`${index}-${lastIndex}`} style={styles.lineDefault}>
            {line.substring(lastIndex)}
          </Text>
        );
      }

      return (
        <Text key={index} style={styles.codeLine}>
          {elements.length > 0 ? elements : ' '}
        </Text>
      );
    };

    const lines = activeSource.split('\n');

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
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

          <View style={styles.titleRow}>
            <FileCode size={16} color={C.primary} strokeWidth={2} />
            <Text style={styles.title}>Manuscris Typst (proof.typ)</Text>
          </View>
          <Text style={styles.subtitle}>
            Cod sursă generat automat din arborele deductiv AST pentru
            tehnoredactare PDF.
          </Text>

          {activeSource ? (
            <View style={styles.codeBlock}>
              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                  {lines.map((line, idx) => renderSyntaxLine(line, idx))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.subtitle}>
              Nu există manuscris Typst pentru această analiză.
            </Text>
          )}

          <Pressable
            onPress={handleCopy}
            disabled={!activeSource}
            style={[styles.copyButton, !activeSource && { opacity: 0.5 }]}
          >
            <Copy size={15} color={C.primaryFg} strokeWidth={2} />
            <Text style={styles.copyButtonText}>Copiază Sursa Typst</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

TypstSheet.displayName = 'TypstSheet';

const styles = StyleSheet.create({
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: F.mathMed,
    fontSize: 18,
    color: C.foreground,
  },
  subtitle: {
    fontFamily: F.ui,
    fontSize: 12,
    color: C.mutedFg,
    marginBottom: 12,
    marginTop: 2,
  },
  codeBlock: {
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    padding: 16,
    flex: 1,
  },
  codeLine: {
    fontFamily: F.mono,
    fontSize: 11.5,
    lineHeight: 19,
  },
  lineDefault: {
    fontFamily: F.mono,
    fontSize: 11.5,
    lineHeight: 19,
    color: 'rgba(252, 251, 248, 0.85)',
  },
  lineHeading: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    lineHeight: 19,
    color: '#86EFAC',
  },
  tokenMath: {
    fontFamily: F.mono,
    fontSize: 11.5,
    lineHeight: 19,
    color: '#FDE68A',
  },
  tokenKeyword: {
    fontFamily: F.mono,
    fontSize: 11.5,
    lineHeight: 19,
    color: '#93C5FD',
  },
  tokenBold: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    lineHeight: 19,
    color: '#FFFFFF',
  },
  tokenString: {
    fontFamily: F.mono,
    fontSize: 11.5,
    lineHeight: 19,
    color: '#86EFAC',
  },
  copyButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: C.slateDeep,
    borderRadius: 6,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  copyButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 13.5,
    color: C.primaryFg,
  },
});
