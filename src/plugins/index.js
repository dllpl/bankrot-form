/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'

import * as VeeValidate from './validate'

export function registerPlugins (app) {
  app.use(vuetify);
  app.use(VeeValidate);
}
