/**
 * @typedef {Object} State
 */

/**
 * @callback Getter
 * @param {State} state
 * @returns {any}
 */

/**
 * @template T, M
 * @callback Mutator
 * @param {T} state
 * @param {M} change
 * @returns {void}
 */

/**
 * @template T, M
 * @callback Action
 * @param {{commit: function(string, M):void}} context
 * @param {T} [payload]
 * @returns {void|Promise<any>}
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

/**
 *@typedef  {ServiceRootBase & OdataIdRef & OdataContext & OdataEtag & OdataType } ServiceRoot
 */

/**
 * @typedef {Object} ServiceRootBase
 * @property {OdataIdRef} AccountService
 * @property {OdataIdRef} AggregationService
 * @property {OdataIdRef} Cables
 * @property {OdataIdRef} CertificateService
 * @property {OdataIdRef} Chassis
 * @property {OdataIdRef} CompositionService
 * @property {string} Description
 * @property {OdataIdRef} EventService
 * @property {OdataIdRef} Fabrics
 * @property {OdataIdRef} Facilities
 * @property {string} Id
 * @property {OdataIdRef} JobService
 * @property {OdataIdRef} JsonSchemas
 * @property {OdataIdRef} KeyService
 * @property {Links} Links
 * @property {OdataIdRef} Managers
 * @property {OdataIdRef} NVMeDomains
 * @property {string} Name
 * @property {Oem} Oem
 * @property {OdataIdRef} PowerEquipment
 * @property {string} Product
 * @property {ProtocolFeaturesSupported} ProtocolFeaturesSupported
 * @property {string} RedfishVersion
 * @property {OdataIdRef} Registries
 * @property {OdataIdRef} ResourceBlocks
 * @property {OdataIdRef} SessionService
 * @property {OdataIdRef} Storage
 * @property {OdataIdRef} StorageServices
 * @property {OdataIdRef} StorageSystems
 * @property {OdataIdRef} Systems
 * @property {OdataIdRef} Tasks
 * @property {OdataIdRef} TelemetryService
 * @property {string} UUID
 * @property {OdataIdRef} UpdateService
 * @property {string} Vendor
 */
/**
 * @typedef {{
 * '@odata.id': string
 * }} OdataIdRef
 */
/**
 * @typedef {{
 * '@odata.context': string
 * }} OdataContext
 */
/**
 * @typedef {{
 * '@odata.etag': string
 * }} OdataEtag
 */
/**
 * @typedef {{
 * '@odata.type': string
 * }} OdataType
 */
/**
 * @typedef {Object} Links
 * @property {Oem} Oem
 * @property {Sessions} Sessions
 */
/**
 * @typedef {Object} Oem
 * @property {Object} additionalProp1
 */
/**
 * @typedef {Object} ProtocolFeaturesSupported
 * @property {DeepOperations} DeepOperations
 * @property {boolean} ExcerptQuery
 * @property {ExpandQuery} ExpandQuery
 * @property {boolean} FilterQuery
 * @property {boolean} OnlyMemberQuery
 * @property {boolean} SelectQuery
 */
/**
 * @typedef {Object} DeepOperations
 * @property {boolean} DeepPATCH
 * @property {boolean} DeepPOST
 * @property {number} MaxLevels
 */
/**
 * @typedef {Object} ExpandQuery
 * @property {boolean} ExpandAll
 * @property {boolean} Levels
 * @property {boolean} Links
 * @property {number} MaxLevels
 * @property {boolean} NoLinks
 */

/**
 * @typedef {{
 * Members: OdataIdRef[],
 * 'Members@odata.count': number,
 * 'Members@odata.nextLink': string,
 * }} Collection
 */
/**
 * @typedef {Collection & OdataContext & OdataEtag & OdataIdRef & OdataType & Oem} ComputerSystemCollection
 * @prop {string} Name
 * @property {string} Description
 */
/**
 * @typedef {Collection & OdataContext & OdataEtag & OdataIdRef & OdataType & Oem} ManagerCollection
 * @prop {string} Name
 * @property {string} Description
 */
