/**
 * Represents store module configuration
 * @type {StoreModule}
 * @property {string} namespace store's namespace
 * @property {StoreOptions} store store module options
 * @property {Enum} getters store's getters enum
 * @property {Enum} actions store's actions enum
 * @property {Namespaced}  namespaced
 */
export default class StoreModule {
  namespace;
  store;
  getters;
  actions;

  /**
   * Creates new instance of StoreModule class
   * @param {string} namespace
   * @param {StoreOptions} store
   * @param {Enum} getters
   * @param {Enum} actions
   */
  constructor(namespace, store, getters, actions) {
    this.namespace = namespace;
    this.store = store;
    this.getters = this.namespaced(getters, namespace);
    this.actions = this.namespaced(actions, namespace);
  }

  /**
   * Creates enum like object with values that are namespace scoped
   * @type {Namespaced}
   */
  namespaced(options, namespace) {
    if (!options) {
      throw new Error('options cannot be null nor undefined');
    }

    const result = {};
    Object.keys(options).forEach((p) => {
      result[p] = `${namespace}/${options[p]}`;
    });

    Object.freeze(result);
    return result;
  }
}
