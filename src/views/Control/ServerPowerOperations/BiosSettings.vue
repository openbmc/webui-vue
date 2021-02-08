<template>
  <div class="bios-form-background">
    <template v-for="(attriValues, key) of attributeValues">
      <b-form-group
        :key="key"
        :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
        class="mb-4"
      >
        <b-form-select
          v-if="attriValues.length > 2 && key !== 'pvm_system_power_off_policy'"
          id="bios-option-sysOp-mode"
          :value="attributeKeys[key]"
          :options="attriValues"
          @change="updateAttributeKeys(key, $event)"
        >
        </b-form-select>
        <template v-for="(values, keys) of attriValues">
          <b-form-radio
            v-if="
              attriValues.length <= 2 && key !== 'pvm_system_power_off_policy'
            "
            :key="values.value"
            v-model="attributeKeys[key]"
            :value="values.value"
          >
            {{ values.text }}
          </b-form-radio>
          <template v-if="key === 'pvm_system_power_off_policy'">
            <b-form-radio
              :key="values.value"
              v-model="attributeKeys[key]"
              :value="values.value"
              :aria-describedby="values.value"
            >
              {{ values.value }}
            </b-form-radio>
            <b-form-text
              v-if="values.value === 'Power Off'"
              :id="values.value"
              :key="keys"
              class="ml-4 mb-3"
            >
              {{
                $t(
                  'pageServerPowerOperations.biosSettings.attributeValues.pvm_system_power_off_policy.powerOffHelperText'
                )
              }}
            </b-form-text>
            <b-form-text
              v-if="values.value === 'Automatic'"
              :id="values.value"
              :key="keys"
              class="ml-4 mb-3"
            >
              {{
                $t(
                  'pageServerPowerOperations.biosSettings.attributeValues.pvm_system_power_off_policy.automaticHelperText'
                )
              }}
            </b-form-text>
            <b-form-text
              v-if="values.value === 'Stay On'"
              :id="values.value"
              :key="keys"
              class="ml-4 mb-3"
            >
              {{
                $t(
                  'pageServerPowerOperations.biosSettings.attributeValues.pvm_system_power_off_policy.stayOnHelperText'
                )
              }}
            </b-form-text>
          </template>
        </template>
      </b-form-group>
    </template>
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
      attributeKeys: { ...this.attributes },
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
<style lang="scss" scoped>
.custom-select {
  margin-bottom: 0.3rem;
}
</style>
