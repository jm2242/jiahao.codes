import Typography from 'typography';
import theme from 'typography-theme-fairy-gates';

theme.bodyFontFamily = ['Source Sans Pro', 'sans-serif'];
theme.googleFonts = [
  {
    name: 'Work Sans',
    styles: ['500', '600'],
  },
  {
    name: 'Source Sans Pro',
    styles: ['400', '400i'],
  },
];

const typography = new Typography(theme);
const { rhythm, scale } = typography;
export { rhythm, scale }
export default typography
