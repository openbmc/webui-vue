# Internationalization

The OpenBMC Web UI implements internationalization and separates the language-
specific parts of the interface from the rest of the code, so they can be easily
replaced. The OpenBMC Web UI uses the following library for
internationalization:

- [Vue I18n v9+ (Vue 3)](https://vue-i18n.intlify.dev/)

## Key naming convention

The OpenBMC Web UI follows the following key naming conventions:

- Page specific labels should be nested in an object with a key prefixed `page`
  followed by the page title. Formatting in this manner provides a systematic
  structure and improves readability of the language file.
  - e.g. `pageLocalUserManagement.editUser`
- Any 'major' child components should be nested inside page specific objects
  (ex. table, modal)
  - e.g. `pageEventLogs.table.eventType`
- Avoid any complex linked locale messages.
- Alphabetize object keys. This helps in locating the keys.
- For Vue 3, prefer `useI18n()` in component setup/data to access `t`:
  - In templates: continue to use `$t('key.path')`.
  - In scripts: import `useI18n` and read `t` once per component (or use
    `i18n.global.t` in Options API computed/methods where `this.$t` is not
    available).

## Using the Vue I18n plugin

- The `src/i18n.js` file registers Vue I18n with the Vue 3 app via `app.use(i18n)`.
- The CLI creates a `src/locales/en-US.json` file, which contains our default
  translation messages.
- Keys live in `src/locales/*.json`. Use `$t()` in templates or `t()`/`i18n.global.t()`
  in scripts to output translation messages.
- After adding or removing calls to `$t` please run this to ensure consistent
  English translation (note: using variable expansion in key names is not
  handled automatically, you need to manually check them):

```bash
node node_modules/vue-i18n-extract/bin/vue-i18n-extract.js -v 'src/**/*.?(js|vue)' -l 'src/locales/en-US.json'
```

- If you're working on updating a translation for another language (e.g.
  Russian), run this to see the omissions (as well as cruft) and add the
  necessary keys automatically:

```bash
node node_modules/vue-i18n-extract/bin/vue-i18n-extract.js -v 'src/**/*.?(js|vue)' -l 'src/locales/ru-RU.json' -a
```

```json
"pageDumps": {
  "dumpsAvailableOnBmc": "Dumps available on BMC"
}
```

```vue
<page-section :section-title="$t('pageDumps.dumpsAvailableOnBmc')" />
```

- Vue I18n’s `$tc()` function can help with displaying plurals.
  [Learn more about pluralization.](https://kazupon.github.io/vue-i18n/guide/pluralization.html)

```json
"modal": {
  "deleteDump": "Delete dump | Delete dumps"
}
```

```js
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, tc } = useI18n()
    return { t, tc }
  },
  methods: {
    async confirmDelete(count) {
      const title = this.tc('pageDumps.modal.deleteDump', count)
      const message = this.tc('pageDumps.modal.deleteDumpConfirmation', count)
      const ok = await this.$confirm({ message, okTitle: title, cancelTitle: this.t('global.action.cancel') })
      if (ok) {
        // proceed with deletion
      }
    },
  },
}
```

When using the Options API without `setup()`, you can still localize in code via
`i18n.global.t('key')` and `i18n.global.tc('key', count)`.
