const env = process.env;

const ENV_CONSTANTS = {
  name: env.VUE_APP_ENV_NAME || 'openbmc',
  loginLogoEnabled: env.VUE_APP_LOGO_LOGIN_ENABLED || false,
  headerLogoEnabled: env.VUE_APP_LOGO_HEADER_ENABLED || false
};

export default ENV_CONSTANTS;
