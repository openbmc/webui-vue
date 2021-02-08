<template>
  <div class="bios-form-background">
    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.sysOpMode')"
      label-for="bios-option-sysOp-mode"
      label-class="bold"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-sysOp-mode"
        v-model="attributeKeys.pvm_system_operating_mode"
        :options="attributeValues.pvm_system_operating_mode"
        @change="
          updateAttributeKeys(
            'pvm_system_operating_mode',
            attributeKeys.pvm_system_operating_mode
          )
        "
      >
      </b-form-select>
    </b-form-group>

    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.serPowPolicy')"
      label-for="bios-option-server-pow-policy"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-server-pow-policy"
        v-model="attributeKeys.pvm_system_power_off_policy"
        :options="attributeValues.pvm_system_power_off_policy"
        @change="
          updateAttributeKeys(
            'pvm_system_power_off_policy',
            attributeKeys.pvm_system_power_off_policy
          )
        "
      >
      </b-form-select>
    </b-form-group>

    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.fwStartPolicy')"
      label-for="bios-option-fwStart-policy"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-fwStart-policy"
        v-model="attributeKeys.pvm_power_on_st"
        :options="attributeValues.pvm_power_on_st"
        @change="
          updateAttributeKeys('pvm_power_on_st', attributeKeys.pvm_power_on_st)
        "
      >
      </b-form-select>
    </b-form-group>

    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.defPartition')"
      label-for="bios-option-defPart-env"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-defPart-env"
        v-model="attributeKeys.pvm_default_os_type"
        :options="attributeValues.pvm_default_os_type"
        @change="
          updateAttributeKeys(
            'pvm_default_os_type',
            attributeKeys.pvm_default_os_type
          )
        "
      >
      </b-form-select>
    </b-form-group>
    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.partMode')"
      label-for="bios-option-part-mode"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-part-mode"
        v-model="attributeKeys.pvm_rpa_boot_mode"
        :options="attributeValues.pvm_rpa_boot_mode"
        @change="
          updateAttributeKeys(
            'pvm_rpa_boot_mode',
            attributeKeys.pvm_rpa_boot_mode
          )
        "
      >
      </b-form-select>
    </b-form-group>

    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.ibmPartMode')"
      label-for="bios-option-ibmPart-mode"
      class="mb-4"
    >
      <b-form-select
        id="bios-option-fwStart-policy"
        v-model="attributeKeys.pvm_fw_boot_side"
        :options="attributeValues.pvm_fw_boot_side"
        @change="
          updateAttributeKeys(
            'pvm_fw_boot_side',
            attributeKeys.pvm_fw_boot_side
          )
        "
      >
      </b-form-select>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: 'BiosSettings',
  props: {
    attributes: {
      type: Object,
      default: null,
    },
    attributeValues: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      attributeKeys: {
        pvm_system_power_off_policy: this.attributes
          .pvm_system_power_off_policy,
        pvm_default_os_type: this.attributes.pvm_default_os_type,
        pvm_power_on_st: this.attributes.pvm_power_on_st,
        pvm_rpa_boot_mode: this.attributes.pvm_rpa_boot_mode,
        pvm_system_operating_mode: this.attributes.pvm_system_operating_mode,
        pvm_fw_boot_side: this.attributes.pvm_fw_boot_side,
      },
    };
  },
  methods: {
    updateAttributeKeys(key, value) {
      this.attributeKeys[key] = value;
      this.$emit('updated-attributes', this.attributeKeys);
    },
  },
};
</script>
