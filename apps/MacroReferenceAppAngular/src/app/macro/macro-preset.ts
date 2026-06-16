/**
 * Macro Reference — PrimeNG theme preset.
 *
 * PrimeNG 21 uses the @primeuix/themes engine. We extend the Aura preset to map
 * the Macro palette: "Macro Cerulean" (#2aa6e6) as primary and the blue-tinted
 * slate scale as surfaces, with a dark-default color scheme. Pair with
 * `darkModeSelector: '.dark'` in providePrimeNG(). Values mirror
 * MacroThemeCondensed/colors_and_type.css.
 */
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const cerulean = {
  50: '#e7f4fd',
  100: '#c2e4fb',
  200: '#8ecdf6',
  300: '#55b2ee',
  400: '#2aa6e6',
  500: '#1685c2',
  600: '#0f6497',
  700: '#0a476c',
  800: '#08405f',
  900: '#062c44',
  950: '#04202f',
};

const slateDark = {
  0: '#ffffff',
  50: '#f6f7f9',
  100: '#d6dae2',
  200: '#aeb4c1',
  300: '#7b8392',
  400: '#565d6b',
  500: '#3b414c',
  600: '#2a2f39',
  700: '#1e222a',
  800: '#181b22',
  900: '#12141a',
  950: '#0b0d12',
};

const slateLight = {
  0: '#ffffff',
  50: '#f6f7f9',
  100: '#eceef2',
  200: '#d6dae2',
  300: '#aeb4c1',
  400: '#7b8392',
  500: '#565d6b',
  600: '#3b414c',
  700: '#2a2f39',
  800: '#1e222a',
  900: '#12141a',
  950: '#0b0d12',
};

export const MacroPreset = definePreset(Aura, {
  semantic: {
    primary: cerulean,
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.400}',
          activeColor: '{primary.600}',
        },
        surface: slateLight,
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '#041a26',
          hoverColor: '{primary.300}',
          activeColor: '{primary.500}',
        },
        surface: slateDark,
      },
    },
  },
});
