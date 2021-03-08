# Internationalization
The OpenBMC Web UI implements internationalization and separates the language-
specific parts of the interface from the rest of the code, so they can be
easily replaced. The OpenBMC Web UI uses the following library for
internationalization:
- [Vue I18n](https://kazupon.github.io/vue-i18n/introduction.html)

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
- We use the `$t()` function in markup and `this.$t` in scripts (which Vue I18n
provides to our components) for outputting translation messages.

## Using the Vue I18n plugin
- A new `src/i18n.js` file is added and it registers Vue I18n as a plugin to
our Vue instance via the `Vue.use()` function.
- The CLI creates a `src/locales/en.json` file, which contains our default
translation messages.
- The keys are placed in the `src/locales/en.json` file and then the `$t()`
function is used to output the translation messages.
```json
"pageDumps": {
  "dumpsAvailableOnBmc": "Dumps available on BMC"
}
```

```Vue
<page-section :section-title="$t('pageDumps.dumpsAvailableOnBmc')">
```

- Vue I18n’s `$tc()` function can help with displaying plurals.
[Learn more about
pluralization.](https://kazupon.github.io/vue-i18n/guide/pluralization.html)

```json
"modal": {
  "deleteDump": "Delete dump | Delete dumps"
}
```

```JS
this.$bvModal
  .msgBoxConfirm(this.$tc('pageDumps.modal.deleteDumpConfirmation'), {
   title: this.$tc('pageDumps.modal.deleteDump'),
   okTitle: this.$tc('pageDumps.modal.deleteDump'),
   cancelTitle: this.$t('global.action.cancel'),
  })
```