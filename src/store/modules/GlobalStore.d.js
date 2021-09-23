/**
 * Global State
 * @typedef {Object} GlobalState
 * @property {string} assetTag asset Tag
 * @property {string} bmcTime asset Tag
 * @property {string} modelType asset Tag
 * @property {string} serialNumber asset Tag
 * @property {string} serverStatus asset Tag
 * @property {string} languagePreference asset Tag
 * @property {boolean} isUtcDisplay asset Tag
 * @property {string} username asset Tag
 * @property {boolean} isAuthorized asset Tag
 */

/**
 * @typedef {Object} GlobalStoreState
 * @property {GlobalState} state well this is the state
 */

/**
 * Store
 * @typedef {StoreOptions & GlobalStoreState} GlobalStore
 */

/**
 * @typedef {Object} GlobalGetters
 * @property {string} systems systems info
 * @property {string} assetTag asset Tag
 * @property {string} modelType model Type
 * @property {string} serialNumber serial Number
 * @property {string} serverStatus server Status
 * @property {string} bmcTime bmc Time
 * @property {string} languagePreference language Preference
 * @property {string} isUtcDisplay isUtcDisplay
 * @property {string} username username
 * @property {string} isAuthorized isAuthorized
 * @readonly
 */

/**
 * @typedef {Object} GlobalActions
 * @property {string} getBmcTime
 * @property {string} getSystemInfo
 *

/**
 * @typedef {Object} GlobalModuleDef
 * @property {GlobalGetters} getters
 * @property {GlobalActions} actions
 */

/**
 * @typedef {StoreModule & GlobalModuleDef} GlobalStoreModule
 */
