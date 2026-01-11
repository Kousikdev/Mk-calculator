
export type AppMode = 'calculator' | 'converter' | 'currency' | 'ai-assistant' | 'settings' | 'about';
export type CalcLayout = 'standard' | 'scientific';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ButtonShape = 'circle' | 'squircle' | 'rounded' | 'sharp';
export type AppFont = 'Plus Jakarta Sans' | 'Inter' | 'Space Grotesk' | 'Outfit' | 'Montserrat' | 'JetBrains Mono';
export type AppLanguage = 'en' | 'bn';

export interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export interface AppSettings {
  themeColor: string;
  layout: CalcLayout;
  buttonSize: ButtonSize;
  buttonShape: ButtonShape;
  fontFamily: AppFont;
  precision: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  theme: ThemeMode;
  glassBlur: number;
  language: AppLanguage;
}

export interface AppTheme {
  primaryColor: string;
  accentColor: string;
  glassmorphism: number;
  borderRadius: string;
}

export interface CurrencyRate {
  code: string;
  rate: number;
}
