<template>
  <div class="bios-form-background">
    <b-form-group
      :label="$t('pageServerPowerOperations.biosSettings.fwStartPolicy')"
      label-for="bios-option-start-policy"
      class="mb-3"
    >
      <b-form-select
        id="bios-option-start-policy"
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
      :label="$t('pageServerPowerOperations.biosSettings.defPartition')"
      label-for="bios-option-def-partition"
      class="mb-3"
    >
      <b-form-select
        id="bios-option-def-partition"
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
