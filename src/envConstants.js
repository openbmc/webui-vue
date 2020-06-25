const envName = process.env.VUE_APP_ENV_NAME;

const ENV_CONSTANTS = {
  name: envName || 'openbmc',
  intelEnabled: envName === 'intel' ? true : false
};

export default ENV_CONSTANTS;
