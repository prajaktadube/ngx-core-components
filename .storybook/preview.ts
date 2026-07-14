import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs';

// Set up compodoc documentation if available
try {
  // @ts-ignore
  const docJson = require('../documentation.json');
  setCompodocJson(docJson);
} catch (e) {
  // Compodoc documentation not generated yet
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Getting Started', 'Inputs', 'Grid', 'Charts', 'Layout', 'Feedback'],
      },
    },
  },
};

export default preview;
