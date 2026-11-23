import { createTheme } from '@mantine/core';

export const tema = createTheme({
  primaryColor: 'violet',   // cor principal: botões, destaques, links
  defaultRadius: 'md',      // cantos arredondados em todos os componentes
  fontFamily: "'Inter Variable', system-ui, sans-serif",
  headings: {
    fontFamily: "'Inter Variable', system-ui, sans-serif",
    fontWeight: '700',
  },
});