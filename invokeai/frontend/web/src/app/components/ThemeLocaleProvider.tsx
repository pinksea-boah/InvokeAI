import '@fontsource-variable/inter';
import 'overlayscrollbars/overlayscrollbars.css';
import '@xyflow/react/dist/base.css';
import 'common/components/OverlayScrollbars/overlayscrollbars.css';

import { ChakraProvider, extendTheme, theme as _theme, TOAST_OPTIONS } from '@invoke-ai/ui-library';
import type { ReactNode } from 'react';
import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ThemeLocaleProviderProps = {
  children: ReactNode;
};

function ThemeLocaleProvider({ children }: ThemeLocaleProviderProps) {
  const { i18n } = useTranslation();

  const direction = i18n.dir();

  const theme = useMemo(() => {
    return extendTheme({
      ..._theme,
      direction,
      config: {
        ..._theme.config,
        initialColorMode: 'light',
        useSystemColorMode: false,
      },
      colors: {
        ..._theme.colors,
        // 라이트모드 색상으로 오버라이드 (50=어두움, 900=밝음)
        base: {
          50: '#0f172a', // 가장 어두운 톤
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          750: '#f1f5f9', // 추가
          800: '#f8fafc',
          850: '#ffffff', // 추가
          900: '#ffffff', // 가장 밝은 톤
        },
        // 라이트모드에서 테두리가 잘 보이도록 더 진하게 조정
        baseAlpha: {
          50: 'rgba(15, 23, 42, 0.05)',
          100: 'rgba(15, 23, 42, 0.1)',
          200: 'rgba(15, 23, 42, 0.2)',
          250: 'rgba(15, 23, 42, 0.25)',
          300: 'rgba(15, 23, 42, 0.3)',
          400: 'rgba(15, 23, 42, 0.4)',
          500: 'rgba(15, 23, 42, 0.5)',
          600: 'rgba(15, 23, 42, 0.6)',
          700: 'rgba(15, 23, 42, 0.7)',
          800: 'rgba(15, 23, 42, 0.8)',
          900: 'rgba(15, 23, 42, 0.9)',
        },
        // Artifex : Brand Color Change
        invokeYellow: {
          50: '#fef7fe',
          100: '#fce7fc',
          200: '#f8cffa',
          300: '#f2a7f5',
          400: '#ea73ec',
          500: '#ff3eb5',
          600: '#e91e9c',
          700: '#c2185b',
          800: '#9c1458',
          900: '#7b1251',
        },
      },
      shadows: {
        ..._theme.shadows,
        selected:
          'inset 0px 0px 0px 3px var(--invoke-colors-invokeBlue-500), inset 0px 0px 0px 4px var(--invoke-colors-invokeBlue-800)',
        hoverSelected:
          'inset 0px 0px 0px 3px var(--invoke-colors-invokeBlue-400), inset 0px 0px 0px 4px var(--invoke-colors-invokeBlue-800)',
        hoverUnselected:
          'inset 0px 0px 0px 2px var(--invoke-colors-invokeBlue-300), inset 0px 0px 0px 4px var(--invoke-colors-invokeBlue-800)',
        selectedForCompare:
          'inset 0px 0px 0px 3px var(--invoke-colors-invokeGreen-300), inset 0px 0px 0px 4px var(--invoke-colors-invokeGreen-800)',
        hoverSelectedForCompare:
          'inset 0px 0px 0px 3px var(--invoke-colors-invokeGreen-200), inset 0px 0px 0px 4px var(--invoke-colors-invokeGreen-800)',
      },
    });
  }, [direction]);

  useEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  return (
    <ChakraProvider theme={theme} toastOptions={TOAST_OPTIONS}>
      {children}
    </ChakraProvider>
  );
}

export default memo(ThemeLocaleProvider);
