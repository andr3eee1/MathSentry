import { C, F, indigoShadow } from './tokens';

export type ColorTokens = typeof C;
export type FontTokens = typeof F;
export type ShadowToken = typeof indigoShadow;
export type Theme = {
  C: ColorTokens;
  F: FontTokens;
  indigoShadow: ShadowToken;
};
