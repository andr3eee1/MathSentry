import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Check,
  AlertTriangle,
  Pencil,
  CornerDownRight,
  BookOpen,
  FileCode,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { C, F, SPRING_CONFIG } from '@/theme';
import { MathText } from '@/components/MathText';
import { Phase } from '@/components/PipelineStrip';
import { OlympiadAnalysisResult, StepEvaluation } from '@/types/olympiad';

interface ProofCardProps {
  phase: Phase;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
  shakeKey: number;
  analysis: OlympiadAnalysisResult;
  onOpenTypst?: () => void;
  onOpenTheorem?: () => void;
  customStepText?: string;
  onChangeCustomStepText?: (text: string) => void;
}

export const ProofCard: React.FC<ProofCardProps> = ({
  phase,
  inspectorOpen,
  onToggleInspector,
  shakeKey,
  analysis,
  onOpenTypst,
  onOpenTheorem,
  customStepText,
  onChangeCustomStepText,
}) => {
  const [editingInline, setEditingInline] = useState(false);

  // Subtle horizontal shake on failed re-analysis
  const shakeTranslateX = useSharedValue(0);

  useEffect(() => {
    if (shakeKey > 0) {
      shakeTranslateX.value = withSequence(
        withTiming(-5, { duration: 65 }),
        withTiming(5, { duration: 65 }),
        withTiming(-4, { duration: 65 }),
        withTiming(4, { duration: 65 }),
        withTiming(0, { duration: 65 })
      );
    }
  }, [shakeKey]);

  const stepFlawShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeTranslateX.value }],
  }));

  const isSound = phase === 'sound';
  const steps: StepEvaluation[] = analysis.stepBreakdown || [];
  const fatalFlawStep =
    analysis.fatalFlawStep ??
    steps.find((s) => !s.isSound && !s.isCascadedFailure)?.step;
  const hasCorrection = Boolean(customStepText?.trim());

  const problemText = analysis.problemRo;
  const domainText = analysis.domain || 'Matematică';
  const problemCode = analysis.problemTitle || analysis.problemId;
  const onmScore = analysis.scaledScores?.onm7p?.score ?? 0;
  const bacScore = analysis.scaledScores?.bac10p?.score ?? 0;
  const scorePct = analysis.scorePercentage ?? 0;
  const missingCondition = analysis.astNodeBreak?.condition;
  const violatedRule = analysis.astNodeBreak?.rule;

  const handleStartCorrection = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!editingInline && !hasCorrection && missingCondition) {
      onChangeCustomStepText?.(`Deoarece …, avem ${missingCondition}, deci `);
    }
    setEditingInline((prev) => !prev);
  };

  return (
    <View style={styles.manuscriptSheet}>
      {/* 1. Archival Dossier Header */}
      <View style={styles.dossierTopRow}>
        <View style={styles.domainTag}>
          <Text style={styles.domainTagText}>{domainText.toUpperCase()}</Text>
        </View>
        <Text style={styles.dossierCode} numberOfLines={1}>
          {problemCode}
        </Text>
      </View>

      {/* 2. Official Grading Rubric Table (Tabel de Punctaj) */}
      <View style={styles.rubricTable}>
        <View style={styles.rubricCell}>
          <Text style={styles.rubricLabel}>BAREM ONM</Text>
          <Text
            style={[
              styles.rubricValue,
              { color: isSound ? C.success : C.flaw },
            ]}
          >
            {onmScore.toFixed(2)}
            <Text style={styles.rubricMax}> / 7.00p</Text>
          </Text>
        </View>

        <View style={styles.rubricVerticalRule} />

        <View style={styles.rubricCell}>
          <Text style={styles.rubricLabel}>BAREM BAC</Text>
          <Text style={styles.rubricValue}>
            {bacScore.toFixed(2)}
            <Text style={styles.rubricMax}> / 10.0p</Text>
          </Text>
        </View>

        <View style={styles.rubricVerticalRule} />

        <View style={styles.rubricCell}>
          <Text style={styles.rubricLabel}>SCOR FORMAL</Text>
          <Text
            style={[
              styles.rubricValue,
              { color: isSound ? C.success : C.flaw },
            ]}
          >
            {scorePct}%
          </Text>
        </View>
      </View>

      {/* 3. Problem Statement Block */}
      <View style={styles.problemSection}>
        <Text style={styles.sectionSmallHeader}>§1 · ENUNȚUL PROBLEMEI</Text>
        <View style={styles.problemQuoteBox}>
          <MathText style={styles.problemStatementText}>{problemText}</MathText>
        </View>
      </View>

      {/* 4. Deductive Chain & Left Dependency Rail */}
      <View style={styles.deductiveSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionSmallHeader}>
            §2 · LANȚUL DEDUCTIV & ARBORELE AST
          </Text>
          <Text style={styles.railLegendText}>
            {isSound
              ? 'Toate dependențele verificate'
              : fatalFlawStep != null
              ? `Fractură la pasul ${fatalFlawStep}`
              : 'Necesită revizuire'}
          </Text>
        </View>

        <View style={styles.railList}>
          {steps.map((step, idx) => {
            const stepNum = step.step;
            const isLast = idx === steps.length - 1;
            const isThisSound = isSound || step.isSound;
            const isThisCascaded =
              !isThisSound && Boolean(step.isCascadedFailure) && stepNum !== fatalFlawStep;
            // Any other unsound step is shown as a flaw; only the first one gets the editor.
            const isThisFlaw = !isThisSound && !isThisCascaded;
            const isThisFatalFlaw = isThisFlaw && stepNum === fatalFlawStep;

            const awardedPts = ((step.awardedPercentage / 100) * 7.0).toFixed(2);
            const lostPts = (((step.maxPercentage - step.awardedPercentage) / 100) * 7.0).toFixed(2);

            return (
              <View key={`step-${stepNum}`} style={styles.railRow}>
                {/* Left Margin Gutter: Node + Points + Vertical Dependency Line */}
                <View style={styles.railGutter}>
                  <View
                    style={[
                      styles.stepNode,
                      isThisSound && styles.stepNodeSound,
                      isThisFlaw && styles.stepNodeFlaw,
                      isThisCascaded && styles.stepNodeCascaded,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNodeText,
                        isThisSound && { color: C.success },
                        isThisFlaw && { color: '#FFFFFF' },
                        isThisCascaded && { color: C.mutedFg },
                      ]}
                    >
                      §{stepNum}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.gutterPoints,
                      isThisSound && { color: C.success },
                      (isThisFlaw || isThisCascaded) && { color: C.flaw },
                    ]}
                  >
                    {step.awardedPercentage > 0 ? `+${awardedPts}p` : '0.00p'}
                  </Text>

                  {!isLast && (
                    <View
                      style={[
                        styles.connectorLine,
                        isThisSound
                          ? styles.connectorLineSolid
                          : styles.connectorLineBroken,
                      ]}
                    />
                  )}
                </View>

                {/* Right Column: Step Manuscript Content */}
                <View style={styles.railContentCol}>
                  {isThisSound && (
                    <View style={styles.soundStepBox}>
                      <View style={styles.stepHeaderRow}>
                        <Text style={styles.stepTitleMono}>
                          PASUL {stepNum} · {step.label.toUpperCase()}
                        </Text>
                        <View style={styles.verifiedTag}>
                          <Check size={11} color={C.success} strokeWidth={2.5} />
                          <Text style={styles.verifiedTagText}>
                            {step.maxPercentage}%
                          </Text>
                        </View>
                      </View>
                      <MathText style={styles.stepBodyText}>{step.commentRo}</MathText>
                    </View>
                  )}

                  {isThisFlaw && (
                    <Animated.View style={isThisFatalFlaw ? stepFlawShakeStyle : undefined}>
                      <Pressable
                        onPress={isThisFatalFlaw ? onToggleInspector : undefined}
                        style={styles.flawStepBox}
                      >
                        <View style={styles.stepHeaderRow}>
                          <View style={styles.flawTitleCluster}>
                            <AlertTriangle
                              size={13}
                              color={C.flaw}
                              strokeWidth={2.2}
                            />
                            <Text style={styles.flawTitleMono}>
                              PASUL {stepNum} · {step.label.toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.flawPenaltyBadge}>
                            <Text style={styles.flawPenaltyText}>
                              −{lostPts}p
                            </Text>
                          </View>
                        </View>

                        <MathText style={styles.stepBodyText}>{step.commentRo}</MathText>

                        {/* Inspector Toggle Bar */}
                        {isThisFatalFlaw && (
                        <View style={styles.inspectorToggleBar}>
                          <Text style={styles.inspectorToggleLabel}>
                            {inspectorOpen
                              ? 'Ascunde diagnosticul'
                              : 'Vezi ce lipsește și corectează pasul'}
                          </Text>
                          {inspectorOpen ? (
                            <ChevronUp size={14} color={C.flaw} />
                          ) : (
                            <ChevronDown size={14} color={C.flaw} />
                          )}
                        </View>
                        )}

                        {isThisFatalFlaw && inspectorOpen && (
                          <Animated.View
                            entering={FadeIn.duration(180)}
                            exiting={FadeOut.duration(120)}
                            layout={LinearTransition.springify()
                              .damping(SPRING_CONFIG.damping)
                              .stiffness(SPRING_CONFIG.stiffness)}
                            style={styles.astLedgerBox}
                          >
                            {/* Formal AST Diagnostic Table */}
                            {(violatedRule || missingCondition) && (
                            <View style={styles.astDiagnosticTable}>
                              <View style={styles.astDiagRow}>
                                <Text style={styles.astDiagKey}>REGULA AST:</Text>
                                <Text style={styles.astDiagVal}>
                                  {violatedRule || '—'}
                                </Text>
                              </View>
                              <View style={styles.astDiagRow}>
                                <Text style={styles.astDiagKey}>
                                  PREMISĂ LIPSĂ:
                                </Text>
                                <Text
                                  style={[
                                    styles.astDiagVal,
                                    { color: hasCorrection ? C.success : C.flaw },
                                  ]}
                                >
                                  {missingCondition || '—'}{' '}
                                  {hasCorrection
                                    ? '[CORECTURĂ SCRISĂ — RE-AUDITEAZĂ]'
                                    : '[NEDEMONSTRATĂ]'}
                                </Text>
                              </View>
                            </View>
                            )}

                            <View style={styles.correctionActionsRow}>
                              <Pressable
                                onPress={handleStartCorrection}
                                style={[
                                  styles.canonicalFixBtn,
                                  hasCorrection && styles.canonicalFixBtnActive,
                                ]}
                              >
                                {hasCorrection ? (
                                  <Check size={13} color={C.success} strokeWidth={2.5} />
                                ) : (
                                  <Pencil size={13} color={C.foreground} strokeWidth={2} />
                                )}
                                <Text
                                  style={
                                    hasCorrection
                                      ? styles.canonicalFixTextActive
                                      : styles.canonicalFixText
                                  }
                                >
                                  {editingInline
                                    ? 'Ascunde editorul'
                                    : hasCorrection
                                    ? 'Editează corectura'
                                    : `Rescrie pasul ${stepNum}`}
                                </Text>
                              </Pressable>
                            </View>

                            {/* Option B: Inline Manual Step Rewrite */}
                            {editingInline && (
                              <Pressable
                                onPress={(e) => e.stopPropagation()}
                                style={styles.inlineEditorBox}
                              >
                                <Text style={styles.inlineEditorLabel}>
                                  REDACTEAZĂ JUSTIFICAREA PASULUI {stepNum}:
                                </Text>
                                <TextInput
                                  style={styles.inlineTextInput}
                                  multiline
                                  autoFocus
                                  maxLength={4000}
                                  placeholder="Scrie pasul corectat, cu justificarea completă…"
                                  placeholderTextColor={C.mutedFg}
                                  value={customStepText}
                                  onChangeText={(txt) => onChangeCustomStepText?.(txt)}
                                />
                                <Text style={styles.inlineEditorHint}>
                                  Apasă „Re-Auditează” jos când ai terminat.
                                </Text>
                              </Pressable>
                            )}
                          </Animated.View>
                        )}
                      </Pressable>
                    </Animated.View>
                  )}

                  {isThisCascaded && (
                    <View style={styles.cascadedStepBox}>
                      <View style={styles.stepHeaderRow}>
                        <View style={styles.flawTitleCluster}>
                          <CornerDownRight
                            size={13}
                            color={C.mutedFg}
                            strokeWidth={2}
                          />
                          <Text style={styles.cascadedTitleMono}>
                            PASUL {stepNum} · {step.label.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.cascadeTag}>
                          <Text style={styles.cascadeTagText}>
                            ANULAT ÎN CASCADĂ (0p)
                          </Text>
                        </View>
                      </View>
                      <MathText style={styles.cascadedBodyText}>
                        {step.commentRo ||
                          `Acest pas depinde de un pas invalidat, deci nu primește punctaj.`}
                      </MathText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 5. Official Grading Commission Remarks (Raportul Comisiei) */}
      <View style={styles.commissionSection}>
        <View style={styles.commissionHeaderRow}>
          <View style={styles.commissionTitleLeft}>
            <Scale size={15} color={C.primary} strokeWidth={2} />
            <Text style={styles.commissionTitle}>
              §3 · OBSERVAȚIILE COMISIEI DE EVALUARE
            </Text>
          </View>
          <Text
            style={[
              styles.commissionVerdictTag,
              { color: isSound ? C.success : C.flaw },
            ]}
          >
            {isSound ? 'DEMONSTRAȚIE VALIDĂ' : 'NECESITĂ REVIZUIRE'}
          </Text>
        </View>

        <MathText style={styles.commissionCritiqueBody}>
          {analysis.teacherCritiqueRo || analysis.explanationRo}
        </MathText>

        {/* Reference Theorems & Manuscript Links */}
        {analysis?.relevantTheorems && analysis.relevantTheorems.length > 0 && (
          <View style={styles.theoremsBlock}>
            <Text style={styles.theoremsSubheader}>
              TEOREME & AXIOME INVOCATE ÎN DEMONSTRAȚIE:
            </Text>
            {analysis.relevantTheorems.map((th, idx) => (
              <View key={`thm-${idx}`} style={styles.theoremItem}>
                <Text style={styles.theoremItemName}>{th.name}</Text>
                <MathText style={styles.theoremItemStatement}>
                  {th.statement}
                </MathText>
              </View>
            ))}
          </View>
        )}

        {/* Quick Reference Links to Sheets */}
        <View style={styles.sheetLinksRow}>
          {onOpenTheorem && (
            <Pressable
              onPress={onOpenTheorem}
              style={({ pressed }) => [
                styles.sheetLinkBtn,
                pressed && { backgroundColor: C.muted },
              ]}
            >
              <BookOpen size={13} color={C.primary} strokeWidth={2} />
              <Text style={styles.sheetLinkText}>Breviar Teoreme</Text>
            </Pressable>
          )}
          {onOpenTypst && Boolean(analysis.typstSource) && (
            <Pressable
              onPress={onOpenTypst}
              style={({ pressed }) => [
                styles.sheetLinkBtn,
                pressed && { backgroundColor: C.muted },
              ]}
            >
              <FileCode size={13} color={C.primary} strokeWidth={2} />
              <Text style={styles.sheetLinkText}>Exportă Sursa Typst</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  manuscriptSheet: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  dossierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  domainTag: {
    backgroundColor: C.muted,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  domainTagText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.foreground,
    letterSpacing: 0.6,
  },
  dossierCode: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  rubricTable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingVertical: 10,
    marginBottom: 20,
  },
  rubricCell: {
    flex: 1,
    alignItems: 'center',
  },
  rubricVerticalRule: {
    width: 1,
    height: 28,
    backgroundColor: C.border,
  },
  rubricLabel: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rubricValue: {
    fontFamily: F.monoMed,
    fontSize: 14,
    color: C.foreground,
  },
  rubricMax: {
    fontFamily: F.mono,
    fontSize: 11,
    color: C.mutedFg,
  },
  problemSection: {
    marginBottom: 22,
  },
  sectionSmallHeader: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.mutedFg,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  problemQuoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    backgroundColor: C.background,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  problemStatementText: {
    fontSize: 15.5,
    lineHeight: 23,
    color: C.foreground,
  },
  deductiveSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  railLegendText: {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
  },
  railList: {
    flexDirection: 'column',
  },
  railRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  railGutter: {
    width: 46,
    alignItems: 'center',
    paddingRight: 8,
  },
  stepNode: {
    width: 28,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNodeSound: {
    backgroundColor: C.successSoft,
    borderColor: 'rgba(22, 101, 52, 0.35)',
  },
  stepNodeFlaw: {
    backgroundColor: C.flaw,
    borderColor: C.flaw,
  },
  stepNodeCascaded: {
    backgroundColor: C.muted,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  stepNodeText: {
    fontFamily: F.monoMed,
    fontSize: 11,
  },
  gutterPoints: {
    fontFamily: F.mono,
    fontSize: 9.5,
    marginTop: 3,
    marginBottom: 4,
  },
  connectorLine: {
    flex: 1,
    width: 1,
    minHeight: 16,
    marginVertical: 2,
  },
  connectorLineSolid: {
    backgroundColor: C.border,
  },
  connectorLineBroken: {
    borderLeftWidth: 1.5,
    borderLeftColor: C.flaw,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  railContentCol: {
    flex: 1,
    paddingBottom: 14,
  },
  soundStepBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.borderLight,
    borderRadius: 6,
    padding: 12,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepTitleMono: {
    flex: 1,
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.mutedFg,
    letterSpacing: 0.4,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.successSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontFamily: F.monoMed,
    fontSize: 10,
    color: C.success,
  },
  stepBodyText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: C.foreground,
  },
  flawStepBox: {
    backgroundColor: C.flawSoft,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: 'rgba(185, 28, 28, 0.35)',
    borderLeftColor: C.flaw,
    borderRadius: 6,
    padding: 12,
  },
  flawTitleCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flawTitleMono: {
    flex: 1,
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.flaw,
    letterSpacing: 0.4,
  },
  flawPenaltyBadge: {
    backgroundColor: 'rgba(185, 28, 28, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flawPenaltyText: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.flaw,
  },
  inspectorToggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 28, 28, 0.15)',
  },
  inspectorToggleLabel: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.flaw,
  },
  astLedgerBox: {
    marginTop: 10,
    gap: 10,
  },
  astDiagnosticTable: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    padding: 10,
    gap: 6,
  },
  astDiagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  astDiagKey: {
    width: 100,
    fontFamily: F.mono,
    fontSize: 10,
    color: C.mutedFg,
  },
  astDiagVal: {
    flex: 1,
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.foreground,
  },
  correctionActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  canonicalFixBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: C.card,
    borderColor: C.border,
  },
  canonicalFixBtnActive: {
    backgroundColor: C.successSoft,
    borderColor: C.success,
  },
  canonicalFixText: {
    fontFamily: F.uiMed,
    fontSize: 11.5,
    color: C.foreground,
  },
  canonicalFixTextActive: {
    fontFamily: F.uiSemi,
    fontSize: 11.5,
    color: C.success,
  },
  manualEditToggleBtn: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
    justifyContent: 'center',
  },
  manualEditToggleText: {
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.primary,
  },
  inlineEditorBox: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 5,
    padding: 10,
  },
  inlineEditorHint: {
    fontFamily: F.ui,
    fontSize: 11,
    color: C.mutedFg,
    marginTop: 6,
  },
  inlineEditorLabel: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.mutedFg,
    marginBottom: 6,
  },
  inlineTextInput: {
    fontFamily: F.math,
    fontSize: 14,
    color: C.foreground,
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  cascadedStepBox: {
    backgroundColor: C.background,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: 12,
    opacity: 0.75,
  },
  cascadedTitleMono: {
    flex: 1,
    fontFamily: F.mono,
    fontSize: 10.5,
    color: C.mutedFg,
  },
  cascadeTag: {
    backgroundColor: C.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cascadeTagText: {
    fontFamily: F.monoMed,
    fontSize: 9.5,
    color: C.flaw,
  },
  cascadedBodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: C.mutedFg,
  },
  commissionSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  commissionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
  },
  commissionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commissionTitle: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.foreground,
    letterSpacing: 0.6,
  },
  commissionVerdictTag: {
    fontFamily: F.monoMed,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  commissionCritiqueBody: {
    fontSize: 14.5,
    lineHeight: 22,
    color: C.foreground,
    fontFamily: F.mathItalic,
    backgroundColor: C.background,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.borderLight,
    marginBottom: 14,
  },
  theoremsBlock: {
    gap: 8,
    marginBottom: 14,
  },
  theoremsSubheader: {
    fontFamily: F.mono,
    fontSize: 9.5,
    color: C.mutedFg,
    letterSpacing: 0.6,
  },
  theoremItem: {
    backgroundColor: C.background,
    borderLeftWidth: 2,
    borderLeftColor: C.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  theoremItemName: {
    fontFamily: F.monoMed,
    fontSize: 10.5,
    color: C.primary,
    marginBottom: 2,
  },
  theoremItemStatement: {
    fontSize: 13,
    lineHeight: 19,
    color: C.foreground,
  },
  sheetLinksRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.background,
  },
  sheetLinkText: {
    fontFamily: F.uiMed,
    fontSize: 12,
    color: C.primary,
  },
});
