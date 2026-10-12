import DefaultTheme from 'vitepress/theme';
import ColorsAll from '../components/colors/all.vue';
import ColorsBlues from '../components/colors/blues.vue';
import ColorsGrays from '../components/colors/grays.vue';
import ColorsGreens from '../components/colors/greens.vue';
import ColorsReds from '../components/colors/reds.vue';
import ColorsTheme from '../components/colors/theme.vue';
import ColorsYellows from '../components/colors/yellows.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ColorsAll', ColorsAll);
    app.component('ColorsBlues', ColorsBlues);
    app.component('ColorsGrays', ColorsGrays);
    app.component('ColorsGreens', ColorsGreens);
    app.component('ColorsReds', ColorsReds);
    app.component('ColorsTheme', ColorsTheme);
    app.component('ColorsYellows', ColorsYellows);
  },
};
