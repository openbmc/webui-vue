/**
 * @typedef {Object} State
 */

/**
 * @callback Getter
 * @param {State} state
 * @returns {any}
 */

/**
 * @callback Mutator
 * @param {State} state
 * @param {any} change
 * @returns {void}
 */

/**
 * @@callback Action
 * @param {State} state
 * @param {any} [payload]
 * @returns {void|Promise}
 *
 */

/**
 * @typedef {Object.<string,string>} Enum
 * @readonly
 * @enum
 */

/**
 * Store options
 * @typedef {Object} StoreOptions
 * @property {Object.<string,Getter} [getters] - selectors.
 * @property {Object.<string,Action>} [actions] - actions.
 * @property {Object.<string,Mutator>} [mutations] - mutations.
 * @property {Object.<string,any>} [modules] - modules.
 * @property {Object.<string,any>[]} [plugins] - modules.
 * @property {boolean} [strict] - defines if strict mode is enabled.
 * @property {boolean} [devtools] - defines if devtools are used.
 */

/**
 * Represents store module configuration
 * @typedef StoreModule
 * @property {string} namespace store's namespace
 * @property {StoreOptions} store store module options
 * @property {Enum} getters store's getters enum
 * @property {Enum} actions store's actions enum
 * @property {Namespaced}  namespaced
 */

/**
 * Creates enum like object with values that are namespace scoped
 * @callback Namespaced
 * @param {Object.<string,string>} options
 * @param {string} namespace
 * @returns {Enum}
 */
