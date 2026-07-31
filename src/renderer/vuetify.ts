import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'meteormanLight',
    themes: {
      meteormanLight: {
        dark: false,
        colors: {
          primary: '#DF3F4A',
          'primary-darken-1': '#C9323D',
          secondary: '#3D6FE8',
          accent: '#6D5CE7',
          background: '#F4F6FA',
          surface: '#FFFFFF',
          'surface-variant': '#EEF1F6',
          success: '#238A57',
          warning: '#B7791F',
          error: '#C93643',
          info: '#3976D9',
          'on-primary': '#FFFFFF',
          'on-surface': '#202531'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      elevation: 0,
      rounded: 'lg'
    },
    VCard: {
      rounded: 'xl'
    },
    VTextField: {
      density: 'compact',
      hideDetails: 'auto',
      variant: 'outlined'
    },
    VSelect: {
      density: 'compact',
      hideDetails: 'auto',
      variant: 'outlined'
    }
  }
});
