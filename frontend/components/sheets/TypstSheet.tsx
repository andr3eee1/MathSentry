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
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { FileCode, Copy, X } from 'lucide-react-native';
import { C, F } from '@/theme';
import { showToast } from '@/components/ToastHelper';

export const TYPST_SOURCE = `#set page(paper: "a4", margin: 2cm)
#set text(font: "New Computer Modern", size: 11pt)

= Problem
Prove that for all real $x != 0$,
$(1 + x)^n >= 1 + n x$ for $n in NN$.

= Proof
*Base case.* For $n = 1$:
$(1 + x)^1 = 1 + 1 dot x$. #h(1fr) $checkmark$

*Inductive hypothesis.* Assume $P(k)$:
$(1 + x)^k >= 1 + k x$.

*Inductive step.* Multiply both sides by $(1 + x)$:
$ (1 + x)^(k+1) >= (1 + k x)(1 + x)
  = 1 + (k+1)x + k x^2 >= 1 + (k+1)x $

*Conclusion.* By induction, $P(n)$ holds
for all $n in NN$. $qed$`;

interface TypstSheetProps {
  onClose?: () => void;
  typstSource?: string;
}

export const TypstSheet = forwardRef<BottomSheetModal, TypstSheetProps>(
  ({ onClose, typstSource }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const activeSource = typstSource || TYPST_SOURCE;

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
      await Clipboard.setStringAsync(activeSource);
      showToast('Typst code copied', 'done');
    };

    // Syntax rendering:
    // $…$ math → warn
    // #keyword → primary
    // *bold* → white bold
    // lines starting = → success semibold
    // "strings" → success
    // rest white 80%
    const renderSyntaxLine = (line: string, index: number) => {
      if (line.startsWith('=')) {
        return (
          <Text key={index} style={styles.lineSuccess}>
            {line}
          </Text>
        );
      }

      // Tokenize the line into segments
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

          {/* Title Row */}
          <View style={styles.titleRow}>
            <FileCode size={16} color={C.primary} strokeWidth={2} />
            <Text style={styles.title}>proof.typ</Text>
          </View>
          <Text style={styles.subtitle}>
            Auto-generated Typst source from the AST.
          </Text>

          {/* Code block */}
          <View style={styles.codeBlock}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                {lines.map((line, idx) => renderSyntaxLine(line, idx))}
              </View>
            </ScrollView>
          </View>

          {/* Copy Button */}
          <Pressable onPress={handleCopy} style={styles.copyButton}>
            <Copy size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.copyButtonText}>Copy Typst Code</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

TypstSheet.displayName = 'TypstSheet';

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: F.uiSemi,
    fontSize: 16,
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
    borderRadius: 12,
    padding: 16,
    flex: 1,
  },
  codeLine: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
  },
  lineDefault: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  lineSuccess: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: C.success,
    fontWeight: '600',
  },
  tokenMath: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: C.warn,
  },
  tokenKeyword: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: C.primary,
  },
  tokenBold: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tokenString: {
    fontFamily: F.mono,
    fontSize: 11,
    lineHeight: 18,
    color: C.success,
  },
  copyButton: {
    marginTop: 12,
    width: '100%',
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  copyButtonText: {
    fontFamily: F.uiSemi,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
