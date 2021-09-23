/**
 * @typedef System
 * @property {string} assetTag
 * @property {string} description
 * @property {string} firmwareVersion
 * @property {string} hardwareType
 * @property {string} health
 * @property {string} id
 * @property {boolean} locationIndicatorActive
 * @property {string} locationNumber
 * @property {string} manufacturer
 * @property {string} memorySummaryHealth
 * @property {string} memorySummaryHealthRollup
 * @property {string} memorySummaryState
 * @property {string} model
 * @property {number} processorSummaryCount
 * @property {string} processorSummaryHealth
 * @property {string} processorSummaryHealthRoll
 * @property {string} processorSummaryState
 * @property {string} powerState
 * @property {string} serialNumber
 * @property {string} healthRollup
 * @property {string} subModel
 * @property {string} statusState
 * @property {string} systemType
 */

/**
 * @typedef SystemStoreState
 * @property {System[]} systems
 */

/**
 * Store
 * @typedef {StoreOptions & SystemStoreState} SystemStore
 */

/**
 * @typedef {Object} SystemGetters
 * @property {string} systems systems info
 * @readonly
 */

/**
 * @typedef {Object} SystemActions
 * @property {string} getSystem
 * @property {string} changeIdentifyLedState
 *

/**
 * @typedef {Object} SystemModuleDef
 * @property {SystemGetters} getters
 * @property {SystemActions} actions
 */

/**
 * @typedef {StoreModule & SystemModuleDef} SystemStoreModule
 */
