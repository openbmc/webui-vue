/**
 * BMC
 * @typedef {Object} Bmc
 * @property {Date} dateTime - BMC time.
 * @property {string} description - BMC description.
 * @property {string} firmwareVersion - BMC firmware version.
 * @property {string} graphicalConsoleConnectTypes - BMC graphical console connect types.
 * @property {boolean} graphicalConsoleEnabled - BMC graphical console enabled.
 * @property {number} graphicalConsoleMaxSessions - BMC graphical console max sessions.
 * @property {string} health - BMC health.
 * @property {string} healthRollup - BMC health rollup.
 * @property {string} id - BMC id.
 * @property {Date} lastResetTime - BMC last reset time.
 * @property {boolean} identifyLed - BMC identify led.
 * @property {string} locationNumber - BMC location number.
 * @property {string} [manufacturer] - BMC manufacturer.
 * @property {string} managerType - BMC manager type.
 * @property {string} model - BMC model.
 * @property {string} name - BMC name.
 * @property {string} partNumber - BMC part number.
 * @property {string} powerState - BMC power state.
 * @property {string} serialConsoleConnectTypes - BMC serial console connect types.
 * @property {boolean} serialConsoleEnabled - BMC serial console enabled.
 * @property {number} serialConsoleMaxSessions - BMC serial console max sessions.
 * @property {string} serialNumber - BMC serial number.
 * @property {string} serviceEntryPointUuid - BMC service entry point UUID.
 * @property {string} sparePartNumber - BMC spare part number.
 * @property {string} statusState - BMC status state.
 * @property {string} uuid - BMC UUID.
 * @property {string} uri - BMC uri.
 */

/**
 * BMC state
 * @typedef {Object} BmcState
 * @property {Bmc} bmc - BMC time.
 */

/**
 * @typedef {Object} BmcStoreState
 * @property {BmcState} state well this is the state
 */

/**
 * Store
 * @typedef {StoreOptions & BmcStoreState} BmcStore
 */

/**
 * @typedef {Object} BmcGetters
 * @property {string} bmc bmc info
 * @readonly
 */

/**
 * @typedef {Object} BmcActions
 * @property {string} getBmcInfo
 * @property {string} updateIdentifyLedValue
 */

/**
 * @typedef {Object} BmcModuleDef
 * @property {BmcGetters} getters
 * @property {BmcActions} actions
 */

/**
 * @typedef {StoreModule & BmcModuleDef} BmcStoreModule
 */
