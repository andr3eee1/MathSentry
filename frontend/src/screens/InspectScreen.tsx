import React from 'react';
import { View, ScrollView, Text, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, FileCode, Check, AlertTriangle, Sparkles, ChevronDown, Pencil, Camera, History, Award } from 'lucide-react-native';
import { C, F, indigoShadow } from '../theme/tokens';
import { PhaseBadge } from '../components/PhaseBadge';
import { useAppStore } from '../store/appStore';
import { ShakeContainer } from '../anim/ShakeContainer';

export function InspectScreen() {
  const insets = useSafeAreaInsets();
  const { phase, fixed, inspectorOpen, hintOpen, shakeKey, setInspectorOpen, toggleHint, setPhase, reset, bumpShake } = useAppStore();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <View style={{ backgroundColor: C.slateDeep, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ChevronLeft size={20} color="rgba(255,255,255,0.6)" />
            <View>
              <Text style={{ fontFamily: F.uiSemi, fontSize: 15, color: C.card, letterSpacing: -0.2 }}>MathSentry Analysis</Text>
              <Text style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{'OCR -> LaTeX -> AST Verified'}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(79,70,229,0.6)', backgroundColor: 'rgba(79,70,229,0.15)' }}>
            <FileCode size={14} color={C.card} />
            <Text style={{ fontFamily: F.uiMed, fontSize: 12, color: C.card }}>Typst</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 16, paddingVertical: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.successSoft }}>
              <Check size={12} color={C.success} />
              <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.success }}>OCR Digitized</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.successSoft }}>
              <Check size={12} color={C.success} />
              <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.success }}>LaTeX Parsed</Text>
            </View>
            <PhaseBadge phase={phase} />
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 288 }}>
        <View style={{ backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ fontFamily: F.uiSemi, fontSize: 10, letterSpacing: 1.5, color: C.mutedFg }}>PROBLEM</Text>
            <Text style={{ fontFamily: F.math, fontSize: 17, lineHeight: 22, color: C.foreground, marginTop: 4 }}>{'Prove that for all real x != 0, (1 + x)^n >= 1 + n x for n in N.'}</Text>
          </View>
          <View style={{ padding: 16, gap: 12 }}>
            <Step title="STEP 1 · BASE CASE" body="For n = 1, (1 + x)^1 = 1 + 1*x, which holds identically." />
            <Step title="STEP 2 · INDUCTIVE HYPOTHESIS" body="Assume P(k) holds for some k in N, so (1 + x)^k >= 1 + k x." />
            <FlawStep expanded={expanded} setExpanded={setExpanded} inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} fixed={fixed} bumpShake={bumpShake} shakeKey={shakeKey} phase={phase} />
            <Step title="STEP 4 · CONCLUSION" body="By Mathematical Induction, P(n) holds for all n in N." />
          </View>
        </View>
      </ScrollView>

      {hintOpen && phase !== 'sound' && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 96 + insets.bottom, zIndex: 20, backgroundColor: C.card, borderWidth: 2, borderColor: C.primary, borderRadius: 16, padding: 16, ...(indigoShadow as any) }}>
          <Pressable onPress={() => toggleHint()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color={C.primary} />
            <Text style={{ fontFamily: F.uiBold, fontSize: 14, flex: 1, color: C.foreground }}>AST Structural Flaw Detected</Text>
            <ChevronDown size={16} color={C.mutedFg} />
          </Pressable>
          <Text style={{ fontFamily: F.ui, fontSize: 13, lineHeight: 21, color: C.mutedFg, marginTop: 8 }}>
            Your logic breaks at <Text style={{ fontFamily: F.uiBold, color: C.foreground }}>Step 3</Text>. You applied Bernoulli's inequality step (multiplying the inequality by 1 + x), but did you verify if the base condition <Text style={{ fontFamily: F.mathItalic, color: C.foreground }}>{'(x > -1)'}</Text> holds true in this domain?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity onPress={() => { setPhase('scanning'); setTimeout(() => setPhase(fixed ? 'sound' : 'flaw'), 1200); }} style={{ flex: 1, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.uiSemi, fontSize: 13, color: C.card }}>Re-Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, borderRadius: 12, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.uiMed, fontSize: 13, color: C.foreground }}>View Relevant Theorem</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {phase === 'sound' && hintOpen && (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 96 + insets.bottom, zIndex: 20, backgroundColor: C.successSoft, borderWidth: 2, borderColor: C.success, borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Check size={20} color={C.success} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.uiBold, fontSize: 14, color: C.foreground }}>AST Logic Sound ✓</Text>
              <Text style={{ fontFamily: F.ui, fontSize: 12, color: C.mutedFg }}>All 4 nodes verified against formal rules.</Text>
            </View>
            <TouchableOpacity onPress={reset}>
              <Text style={{ fontFamily: F.uiMed, fontSize: 12, color: C.primary }}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ position: 'absolute', bottom: 0, height: 80 + insets.bottom, width: '100%', zIndex: 30, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start', paddingTop: 8 }}>
        <TouchableOpacity style={{ width: 80, alignItems: 'center', gap: 4, paddingTop: 4 }}>
          <History size={20} color={C.mutedFg} />
          <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.mutedFg }}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primary, marginTop: -32, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: C.background, ...(indigoShadow as any) }}>
          <Camera size={24} color={C.card} />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 80, alignItems: 'center', gap: 4, paddingTop: 4 }}>
          <Award size={20} color={C.mutedFg} />
          <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.mutedFg }}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(226,232,240,0.7)', padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontFamily: F.uiSemi, fontSize: 11, letterSpacing: 0.6, color: C.mutedFg }}>{title}</Text>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: C.successSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Check size={12} color={C.success} />
        </View>
      </View>
      <Text style={{ fontFamily: F.math, fontSize: 16, lineHeight: 26, color: C.foreground }}>{body}</Text>
    </View>
  );
}

function FlawStep({ expanded, setExpanded, inspectorOpen, setInspectorOpen, fixed, bumpShake, shakeKey }: any) {
  const fixedBody = "Since x > -1, we have 1 + x > 0. Multiply both sides of P(k) by (1 + x): (1 + x)^(k+1) >= (1 + kx)(1 + x) = 1 + (k+1)x + kx^2 >= 1 + (k+1)x.";
  const unfixedBody = "Multiply both sides of P(k) by (1 + x) to obtain (1 + x)^(k+1) >= (1 + kx)(1 + x) = 1 + (k+1)x + kx^2 >= 1 + (k+1)x.";
  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={{ backgroundColor: C.flawSoft, borderLeftWidth: 4, borderLeftColor: C.flaw, borderTopRightRadius: 12, borderBottomRightRadius: 12, padding: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} color={C.flaw} />
          <Text style={{ fontFamily: F.uiSemi, fontSize: 11, letterSpacing: 0.6, color: C.flaw }}>STEP 3 · INDUCTIVE STEP</Text>
        </View>
        <View style={{ backgroundColor: C.flaw, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontFamily: F.uiSemi, fontSize: 10, color: C.card }}>AST Node Break</Text>
        </View>
      </View>
      <Text style={{ fontFamily: F.math, fontSize: 16, lineHeight: 26, color: C.foreground }}>
        {fixed && <Text style={{ backgroundColor: C.successSoft, color: C.success, borderRadius: 4, paddingHorizontal: 4 }}>{'Given x > -1, '}</Text>}
        {fixed ? fixedBody : unfixedBody}
      </Text>
      {!expanded && <Text style={{ fontFamily: F.ui, fontSize: 11, color: 'rgba(239,68,68,0.8)', marginTop: 8 }}>Tap to inspect AST node</Text>}
      {expanded && (
        <View style={{ marginTop: 12 }}>
          <View style={{ backgroundColor: C.slateDeep, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ fontFamily: F.mono, fontSize: 11, lineHeight: 18, color: C.card }}>
              <Text style={{ color: C.primary }}>Inequality_Multiply_Rule</Text> {':: Condition [1 + x > 0] -> '}
              {fixed ? <Text style={{ color: C.success }}>ASSERTED (pending re-analysis)</Text> : <Text style={{ color: C.warn }}>UNVERIFIED</Text>}
            </Text>
          </View>
          <ShakeContainer shakeKey={shakeKey}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); setInspectorOpen(!inspectorOpen); bumpShake(); }} style={{ marginTop: 8, borderWidth: 1, borderColor: fixed ? 'rgba(22,163,74,0.4)' : C.border, backgroundColor: fixed ? C.successSoft : C.card, borderRadius: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {fixed ? <Check size={14} color={C.success} /> : <Pencil size={14} color={C.foreground} />}
              <Text style={{ fontFamily: F.uiMed, fontSize: 12, color: fixed ? C.success : C.foreground }}>{fixed ? 'Domain restriction x > -1 added' : 'Edit Step 3 Condition: add x > -1'}</Text>
            </TouchableOpacity>
          </ShakeContainer>
        </View>
      )}
    </Pressable>
  );
}
