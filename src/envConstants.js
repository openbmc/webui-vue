const envName = process.env.VUE_APP_ENV_NAME;

const ENV_CONSTANTS = {
  name: envName || 'openbmc'
};

export default ENV_CONSTANTS;
