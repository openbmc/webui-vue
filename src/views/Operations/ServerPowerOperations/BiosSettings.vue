<template>
  <div>
    <b-row>
      <template v-for="(attriValuesArr, key) of attributeValues">
        <b-col
          v-if="
            attriValuesArr.length > 2 && key !== 'pvm_system_power_off_policy'
          "
          :key="key"
          sm="6"
        >
          <b-form-group
            :key="key"
            :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
            class="mb-4"
          >
            <b-form-select
              id="bios-option-sysOp-mode"
              :value="attributeKeys[key]"
              :options="attriValuesArr"
              @change="updateAttributeKeys(key, $event)"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col v-else :key="key" sm="12">
          <b-form-group
            :key="key"
            :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
            class="mb-4"
          >
            <template v-for="(values, keys) of attriValuesArr">
              <b-form-radio
                v-if="
                  attriValuesArr.length <= 2 &&
                  key !== 'pvm_system_power_off_policy' &&
                  key !== 'pvm_system_operating_mode'
                "
                :key="values.value"
                v-model="attributeKeys[key]"
                :value="values.value"
                :aria-describedby="values.value"
              >
                {{ values.text }}
              </b-form-radio>
              <template v-if="key === 'pvm_system_operating_mode'">
                <b-form-radio
                  :key="values.value"
                  v-model="attributeKeys[key]"
                  :value="values.value"
                  :aria-describedby="values.value"
                  @change="onChangeSystemOpsMode"
                >
                  {{ values.text }}
                </b-form-radio>
                <template v-if="keys === 1">
                  <b-form-checkbox
                    :key="`${values.value}1`"
                    v-model="automaticRetryConfig"
                    class="mt-2"
                    @change="toggleRetryConfigValue"
                    >{{
                      $t(
                        `pageServerPowerOperations.biosSettings.attributeValues.automaticRetryConfig`
                      )
                    }}
                  </b-form-checkbox>
                  <b-form-checkbox
                    :key="`${values.value}2`"
                    v-model="bootFault"
                    class="mt-2"
                    @change="toggleBootFaultValue"
                    >{{
                      $t(
                        `pageServerPowerOperations.biosSettings.attributeValues.stopBootOnFault`
                      )
                    }}
                  </b-form-checkbox>
                  <template v-if="selectedOperatingMode === 'Manual'">
                    <alert
                      :key="`${values.value}3`"
                      variant="info"
                      class="mb-4"
                    >
                      <p>
                        Current operating mode
                        {{ currentOperatingMode }}
                      </p>
                      <p>
                        On save operating mode will be set to
                        {{ selectedOperatingMode }}
                      </p>
                    </alert>
                    <div :key="`${values.value}4`">
                      <b-link to="/profile-settings">
                        Power restore policy</b-link
                      >
                      will be set to
                      <p>{{ powerPolicy }}</p>
                    </div>
                  </template>
                </template>
              </template>
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
                  class="ml-4"
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
                  class="ml-4"
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
                  class="ml-4"
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
        </b-col>
      </template>
    </b-row>
  </div>
</template>

<script>
import Alert from '@/components/Global/Alert';
export default {
  name: 'BiosSettings',
  components: { Alert },
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
      currentOperatingMode: '',
      selectedOperatingMode: '',
      powerPolicy: '',
      showDiffBackground: false,
      attributeKeys: { ...this.attributes },
      powerRestorePolicy: this.$store.getters[
        'serverBootSettings/powerRestorePolicyValue'
      ],
    };
  },
  computed: {
    automaticRetryConfig: {
      get() {
        return (
          this.$store.getters[
            'serverBootSettings/automaticRetryConfigValue'
          ] === 'RetryAttempts'
        );
      },
      set(value) {
        this.$store.commit(
          'serverBootSettings/automaticRetryConfigValue',
          value
        );
      },
    },
    bootFault: {
      get() {
        return (
          this.$store.getters['serverBootSettings/bootFaultValue'] ===
          'AnyFault'
        );
      },
      set(value) {
        this.$store.commit('serverBootSettings/bootFaultValue', value);
      },
    },
  },
  mounted() {
    this.currentOperatingMode = this.attributeKeys['pvm_system_operating_mode'];
  },
  methods: {
    onChangeSystemOpsMode(value) {
      if (value === 'Manual') {
        this.selectedOperatingMode = value;
        this.powerPolicy === 'Always off';
        this.$store.commit(
          'serverBootSettings/setAutomaticRetryConfigValue',
          'Disabled'
        );
        this.$store.commit(
          'serverBootSettings/setStopBootOnFaultValue',
          'AnyFault'
        );
        this.$store.dispatch('powerPolicy/setPowerRestorePolicy', 'AlwaysOff');
      }
    },
    updateAttributeKeys() {
      this.$emit('updated-attributes', this.attributeKeys);
    },
    toggleRetryConfigValue() {},
    toggleBootFaultValue() {},
  },
};
</script>
<style lang="scss" scoped>
.custom-select {
  margin-bottom: 0.3rem;
}
.isBoot {
  background-color: red;
}
</style>
