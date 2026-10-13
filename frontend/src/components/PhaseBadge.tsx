import React from 'react';
import { View, Text } from 'react-native';
import { Check, AlertTriangle, Loader2 } from 'lucide-react-native';
import { C, F } from '../theme/tokens';
import { Phase } from '../types/state';

export function PhaseBadge({ phase, fixed }: { phase: Phase; fixed?: boolean }) {
  if (phase === 'sound') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.successSoft }}>
        <Check size={12} color={C.success} strokeWidth={2} />
        <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.success }}>AST Logic Sound</Text>
      </View>
    );
  }
  if (phase === 'scanning') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.indigoSoft }}>
        <Loader2 size={12} color={C.primary} strokeWidth={2} />
        <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.primary }}>Evaluating AST…</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: C.warnSoft, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' }}>
      <AlertTriangle size={12} color={C.warn} strokeWidth={2} />
      <Text style={{ fontFamily: F.uiMed, fontSize: 11, color: C.warn }}>AST Logic: 1 Flaw</Text>
    </View>
  );
}
