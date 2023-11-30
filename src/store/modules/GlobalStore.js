import api from "@/store/api";
import { defineStore } from "pinia";
import { ref } from "vue";

const HOST_STATE = {
  on: "xyz.openbmc_project.State.Host.HostState.Running",
  off: "xyz.openbmc_project.State.Host.HostState.Off",
  error: "xyz.openbmc_project.State.Host.HostState.Quiesced",
  diagnosticMode: "xyz.openbmc_project.State.Host.HostState.DiagnosticMode",
};

const serverStateMapper = (hostState) => {
  switch (hostState) {
    case HOST_STATE.on:
    case "On": // Redfish PowerState
      return "on";
    case HOST_STATE.off:
    case "Off": // Redfish PowerState
      return "off";
    case HOST_STATE.error:
    case "Quiesced": // Redfish Status
      return "error";
    case HOST_STATE.diagnosticMode:
    case "InTest": // Redfish Status
      return "diagnosticMode";
    default:
      return "unreachable";
  }
};

export const GlobalStore = defineStore("global", () => {
  // state variables
  const assetTag = ref(null);
  const bmcTime = ref(null);
  const modelType = ref(null);
  const serialNumber = ref(null);
  const serverStatus = ref("unreachable");
  const languagePreference = ref(
    localStorage.getItem("storedLanguage") || "en-US"
  );
  const isUtcDisplay = ref(
    localStorage.getItem("storedUtcDisplay")
      ? JSON.parse(localStorage.getItem("storedUtcDisplay"))
      : true
  );
  const username = ref(localStorage.getItem("storedUsername"));
  const isAuthorized = ref(true);
  const userPrivilege = ref(null);

  // Declare functions to update state
  const setAssetTag = (value) => (assetTag.value = value);
  const setModelType = (value) => (modelType.value = value);
  const setSerialNumber = (value) => (serialNumber.value = value);
  const setBmcTime = (value) => (bmcTime.value = value);
  const setServerStatus = (serverState) =>
    (serverStatus.value = serverStateMapper(serverState));
  const setLanguagePreference = (value) => (languagePreference.value = value);
  const setUsername = (value) => (username.value = value);
  const setUtcTime = (value) => (isUtcDisplay.value = value);
  const setUnauthorized = () => {
    isAuthorized.value = false;
    window.setTimeout(() => {
      isAuthorized.value = true;
    }, 100);
  };
  const setPrivilege = (value) => (userPrivilege.value = value);

  // Declare asynchronous functions
  const getBmcTime = async () => {
    try {
      const response = await api.get("/redfish/v1/Managers/bmc");
      const bmcDateTime = response.data.DateTime;
      const date = new Date(bmcDateTime);
      setBmcTime(date);
    } catch (error) {
      console.error(error);
    }
  };
  const getSystemInfo = async () => {
    try {
      const response = await api.get("api/redfish/v1/Systems/system");
      const {
        AssetTag,
        Model,
        PowerState,
        SerialNumber,
        Status: { State } = {},
      } = response.data || {};
      setAssetTag(AssetTag);
      setSerialNumber(SerialNumber);
      setModelType(Model);
      if (State === "Quiesced" || State === "InTest") {
        setServerStatus(State);
      } else {
        setServerStatus(PowerState);
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Return the variables and functions that should be accessible from outside
  return {
    assetTag,
    bmcTime,
    modelType,
    serialNumber,
    serverStatus,
    languagePreference,
    isUtcDisplay,
    username,
    isAuthorized,
    userPrivilege,
    setAssetTag,
    setModelType,
    setSerialNumber,
    setBmcTime,
    setServerStatus,
    setLanguagePreference,
    setUsername,
    setUtcTime,
    setUnauthorized,
    setPrivilege,
    getBmcTime,
    getSystemInfo,
  };
});
export default GlobalStore;
