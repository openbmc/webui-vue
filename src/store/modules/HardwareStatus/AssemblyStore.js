import api from '@/store/api';
import i18n from '@/i18n';

const IPMI_FRU_CHASSIS_TYPE = {
  0: 'Unspecified',
  1: 'Other',
  2: 'Unknown',
  3: 'Desktop',
  4: 'Low Profile Desktop',
  5: 'Pizza Box',
  6: 'Mini Tower',
  7: 'Tower',
  8: 'Portable',
  9: 'LapTop',
  10: 'Notebook',
  11: 'Hand Held',
  12: 'Docking Station',
  13: 'All in One',
  14: 'Sub Notebook',
  15: 'Space-saving',
  16: 'Lunch Box',
  17: 'Main Server Chassis',
  18: 'Expansion Chassis',
  19: 'SubChassis',
  20: 'Bus Expansion Chassis',
  21: 'Peripheral Chassis',
  22: 'RAID Chassis',
  23: 'Rack Mount Chassis',
  24: 'Sealed-case PC',
  25: 'Multi-system Chassis',
  26: 'CompactPCI',
  27: 'AdvancedTCA',
  28: 'Blade',
  29: 'Blade Enclosure',
};

const AssemblyStore = {
  namespaced: true,
  state: {
    assemblies: null,
  },
  getters: {
    assemblies: (state) => state.assemblies,
  },
  mutations: {
    setAssemblyInfo: (state, data) => {
      state.assemblies = data.map((assembly) => {
        const {
          MemberId,
          PartNumber,
          SerialNumber,
          SparePartNumber,
          Model,
          Name,
          Location,
          LocationIndicatorActive,
        } = assembly;
        return {
          id: MemberId,
          partNumber: PartNumber,
          serialNumber: SerialNumber,
          sparePartNumber: SparePartNumber,
          model: Model,
          name: Name,
          locationNumber: Location?.PartLocation?.ServiceLabel,
          identifyLed: LocationIndicatorActive,
          uri: assembly['@odata.id'],
        };
      });
    },
    addAssemblyInfo: (state, data) => {
      state.assemblies = [...data, ...state.assemblies];
    },
    setAssemblyInfoDefault: (state) => {
      state.assemblies = [];
    },
  },
  actions: {
    async getAssemblyInfo({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Assembly')
        .then(({ data }) => commit('setAssemblyInfo', data?.Assemblies))
        .catch((error) => console.log(error));
    },
    async updateIdentifyLedValue({ dispatch }, led) {
      const uri = led.uri;
      const updatedIdentifyLedValue = {
        Assemblies: [
          {
            MemberId: led.memberId,
            LocationIndicatorActive: led.identifyLed,
          },
        ],
      };

      return await api
        .patch(uri, updatedIdentifyLedValue)
        .then(() => {
          if (led.identifyLed) {
            return i18n.t('pageInventory.toast.successEnableIdentifyLed');
          } else {
            return i18n.t('pageInventory.toast.successDisableIdentifyLed');
          }
        })
        .catch((error) => {
          dispatch('getAssemblyInfo');
          console.log('error', error);
          if (led.identifyLed) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed'),
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed'),
            );
          }
        });
    },
    async getFruInfo({ commit, dispatch, getters }) {
      commit('setAssemblyInfoDefault');
      let collection = getters.chassis;
      if (!collection || !collection.length)
        collection = await dispatch('getChassisCollection');
      if (!collection || !collection.length) return;
      collection.forEach(async (chassis) => {
        const assemblyList = await dispatch('getChassisAssembly', chassis);
        if (typeof(assemblyList) == "undefined" || !assemblyList.length) return;
        const assemblyData = [];
        let boardData = {};
        let productData = {};
        let chassisData = {};
        assemblyList.forEach((assembly) => {
          const oem = assembly.Oem;
          const keys = oem ? Object.keys(oem) : null;
          const oemProperties = keys ? oem[keys?.[0]] : null;
          if (assembly.PhysicalContext === 'Board') {
            boardData = {
              boardProductName: assembly.Model,
              boardPartNumber: assembly.PartNumber,
              boardSerialNumber: assembly.SerialNumber,
              boardManufactureDate: assembly.ProductionDate
                ? new Date(assembly.ProductionDate)
                : null,
              boardManufacturer: assembly.Vendor,
              boardFruFileId: assembly.Version,
              boardExtra: oemProperties?.VendorData?.join(';'),
            };
          } else if (assembly.PhysicalContext === 'SystemBoard') {
            productData = {
              productProductName: assembly.Model,
              productPartNumber: assembly.PartNumber,
              productSerialNumber: assembly.SerialNumber,
              productManufacturer: assembly.Vendor,
              productVersion: assembly.Version,
              productAssetTag: chassis?.data?.AssetTag,
              productExtra: oemProperties?.VendorData?.join(';'),
            };
          } else if (assembly.PhysicalContext === 'Chassis') {
            chassisData = {
              chassisType: assembly.Model
                ? IPMI_FRU_CHASSIS_TYPE[assembly.Model]
                : '',
              chassisPartNumber: assembly.PartNumber,
              chassisSerialNumber: assembly.SerialNumber,
              chassisExtra: oemProperties?.VendorData?.join(';'),
            };
          }
        });
        assemblyData.push({
          name: boardData?.boardProductName,
          boardProductName: boardData?.boardProductName,
          boardPartNumber: boardData?.boardPartNumber,
          boardSerialNumber: boardData?.boardSerialNumber,
          boardManufactureDate: boardData?.boardManufactureDate
            ? new Date(boardData?.boardManufactureDate)
            : null,
          boardManufacturer: boardData?.boardManufacturer,
          boardFruFileId: boardData?.boardFruFileId,
          boardExtra: boardData?.boardExtra,
          productProductName: productData?.productProductName,
          productPartNumber: productData?.productPartNumber,
          productSerialNumber: productData?.productSerialNumber,
          productManufacturer: productData?.productManufacturer,
          productVersion: productData?.productVersion,
          productAssetTag: productData?.productAssetTag,
          productExtra: productData?.productExtra,
          chassisType: chassisData?.chassisType,
          chassisPartNumber: chassisData?.chassisPartNumber,
          chassisSerialNumber: chassisData?.chassisSerialNumber,
          chassisExtra: chassisData?.chassisExtra,
        });
        commit('addAssemblyInfo', assemblyData);
      });
    },
  },
};

export default AssemblyStore;
