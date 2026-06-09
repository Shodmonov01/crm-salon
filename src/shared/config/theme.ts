import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',

  colors: {
    blue: [
      '#eff8ff',
      '#d1e9ff',
      '#b2ddff',
      '#84caff',
      '#53b1fd',
      '#2e90fa',
      '#1570ef',
      '#175cd3',
      '#1849a9',
      '#194185',
    ],
  },

  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',

  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    sizes: {
      h1: { fontSize: rem(40), lineHeight: rem(48) },
      h2: { fontSize: rem(32), lineHeight: rem(40) },
      h3: { fontSize: rem(24), lineHeight: rem(32) },
      h4: { fontSize: rem(20), lineHeight: rem(24) },
      h5: { fontSize: rem(16), lineHeight: rem(20) },
      h6: { fontSize: rem(12), lineHeight: rem(16) },
    },
  },

  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },

  radius: {
    xs: rem(4),
    sm: rem(6),
    md: rem(8),
    lg: rem(12),
    xl: rem(16),
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
  },

  components: {
    Button: {
      defaultProps: { radius: 'md' },
    },
    Card: {
      defaultProps: { radius: 'lg', shadow: 'xs', padding: 'xl' },
    },
    TextInput: {
      defaultProps: { radius: 'md' },
    },
    Select: {
      defaultProps: { radius: 'md' },
    },
    ActionIcon: {
      defaultProps: { radius: 'md' },
    },
    Badge: {
      defaultProps: { radius: 'sm' },
    },
    Paper: {
      defaultProps: { radius: 'lg', shadow: 'xs' },
    },
    Modal: {
      defaultProps: { radius: 'lg', padding: 'xl' },
    },
    Drawer: {
      defaultProps: { padding: 'xl' },
    },
    Notification: {
      defaultProps: { radius: 'md' },
    },
  },
});
