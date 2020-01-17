<template>
  <nav>
    <ul>
      <li><router-link to="/">Overview</router-link></li>
      <li>
        <router-link to="/access-control/local-user-management"
          >Local User Management</router-link
        >
      </li>
    </ul>
  </nav>
</template>

<script>
// import Analytics16 from "@carbon/icons-vue/es/analytics/16";
// import DataCheck16 from "@carbon/icons-vue/es/data--check/16";
// import SettingsAdjust16 from "@carbon/icons-vue/es/settings--adjust/16";
// import Settings16 from "@carbon/icons-vue/es/settings/16";
// import Password16 from "@carbon/icons-vue/es/password/16";

export default {
  name: "AppNavigation"
  // components: {
  //   Analytics16,
  //   DataCheck16,
  //   SettingsAdjust16,
  //   Settings16,
  //   Password16
  // }
};
</script>
