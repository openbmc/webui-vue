<template>
  <div>
    <b-row>
      <template v-for="(attriValuesArr, key) of attributeValues">
        <b-col
          v-if="
            attriValuesArr.length > 2 && key !== 'pvm_system_power_off_policy'
          "
          :key="key"
          sm="8"
          xl="6"
        >
          <b-form-group
            :key="key"
            :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
            class="mb-4"
          >
            <b-form-select
              id="bios-option-sysOp-mode"
              v-model="attributeKeys[key]"
              :options="attriValuesArr"
            >
            </b-form-select>
          </b-form-group>
        </b-col>
        <b-col v-else :key="key" class="mb-3" sm="12">
          <div
            :class="{
              'form-background p-3':
                key === 'pvm_system_operating_mode' &&
                (manualModeSelected || selectedOperatingMode === normalMode),
            }"
          >
            <b-form-group
              :key="key"
              :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
              class="m-0"
            >
              <b-row v-if="key === 'pvm_system_operating_mode'">
                <b-col sm="5">
                  <b-form-radio
                    v-for="values of attriValuesArr"
                    :key="values.value"
                    v-model="attributeKeys[key]"
                    :value="values.value"
                    :aria-describedby="values.value"
                    @change="onChangeSystemOpsMode"
                  >
                    {{ values.text }}
                  </b-form-radio>
                  <b-form-checkbox
                    v-model="automaticRetryConfig"
                    class="mt-3"
                    :disabled="manualModeSelected"
                    >{{
                      $t(
                        `pageServerPowerOperations.biosSettings.attributeValues.automaticRetryConfig`
                      )
                    }}
                  </b-form-checkbox>
                  <b-form-checkbox
                    v-model="bootFault"
                    class="mt-3 mb-3"
                    :disabled="manualModeSelected"
                    >{{
                      $t(
                        `pageServerPowerOperations.biosSettings.attributeValues.stopBootOnFault`
                      )
                    }}
                  </b-form-checkbox>
                </b-col>
                <div
                  v-if="
                    manualModeSelected || currentOperatingMode !== normalMode
                  "
                  class="mr-4 section-left-divider"
                ></div>
                <b-col
                  v-if="
                    selectedOperatingMode &&
                    selectedOperatingMode !== currentOperatingMode
                  "
                  sm="5"
                >
                  <alert variant="info" class="mb-4">
                    <p>
                      {{
                        $t(
                          `pageServerPowerOperations.biosSettings.currentOperatingMode`,

                          { currOptMode: currentOperatingMode }
                        )
                      }}
                    </p>
                    <p>
                      {{
                        $t(
                          `pageServerPowerOperations.biosSettings.selectedOperatingMode`,

                          { selectedOptMode: selectedOperatingMode }
                        )
                      }}
                    </p>
                  </alert>
                  <div>
                    <b-link to="/settings/power-restore-policy">
                      {{ $t(`appPageTitle.powerRestorePolicy`) }}
                    </b-link>
                    {{
                      $t(
                        `pageServerPowerOperations.biosSettings.powPolicySection`,
                        {
                          powerPolicy: powerPolicy,
                        }
                      )
                    }}
                  </div>
                </b-col>
                <b-col v-else-if="currentOperatingMode === manualMode" sm="5">
                  <alert variant="warning" class="mb-4">
                    <p>
                      {{
                        $t(
                          `pageServerPowerOperations.biosSettings.currentOperatingMode`,
                          { currOptMode: currentOperatingMode }
                        )
                      }}
                    </p>
                  </alert>
                  <div>
                    <b-link to="/settings/power-restore-policy">
                      {{ $t(`appPageTitle.powerRestorePolicy`) }}
                    </b-link>
                    {{
                      $t(
                        'pageServerPowerOperations.biosSettings.powPolicySection',
                        {
                          powerPolicy: powerPolicy,
                        }
                      )
                    }}
                  </div>
                </b-col>
              </b-row>
              <template v-for="(values, keys) of attriValuesArr">
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
          </div>
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
      manualMode: 'Manual',
      normalMode: 'Normal',
      currentOperatingMode: '',
      selectedOperatingMode: '',
      attributeKeys: { ...this.attributes },
      powerRestorePolicy: this.$store.getters[
        'serverBootSettings/powerRestorePolicyValue'
      ],
    };
  },
  computed: {
    manualModeSelected() {
      return this.selectedOperatingMode === this.manualMode;
    },
    automaticRetryConfig: {
      get() {
        return (
          this.$store.getters[
            'serverBootSettings/automaticRetryConfigValue'
          ] === 'RetryAttempts'
        );
      },
      set(value) {
        let configValue = value ? 'RetryAttempts' : 'Disabled';
        this.$store.commit(
          'serverBootSettings/setAutomaticRetryConfigValue',
          configValue
        );
      },
    },
    powerPolicy() {
      return this.$store.getters['serverBootSettings/powerRestorePolicyValue'];
    },
    bootFault: {
      get() {
        return (
          this.$store.getters['serverBootSettings/bootFaultValue'] ===
          'AnyFault'
        );
      },
      set(value) {
        let bootValue = value ? 'AnyFault' : 'Never';
        this.$store.commit(
          'serverBootSettings/setStopBootOnFaultValue',
          bootValue
        );
      },
    },
  },
  created() {
    this.currentOperatingMode = this.attributeKeys['pvm_system_operating_mode'];
    if (this.currentOperatingMode === this.manualMode) {
      this.onChangeSystemOpsMode(this.manualMode);
    }
  },
  updated() {
    this.$emit('updated-attributes', this.attributeKeys);
  },
  methods: {
    onChangeSystemOpsMode(value) {
      this.selectedOperatingMode = value;
      if (this.selectedOperatingMode === this.normalMode) {
        if (this.currentOperatingMode === this.selectedOperatingMode) {
          this.$store.dispatch('serverBootSettings/getOperatingModeSettings');
        } else {
          this.$store.commit(
            'serverBootSettings/setAutomaticRetryConfigValue',
            'RetryAttempts'
          );
          this.$store.commit(
            'serverBootSettings/setStopBootOnFaultValue',
            'Never'
          );
          this.$store.commit(
            'serverBootSettings/setPowerRestorePolicyValue',
            'LastState'
          );
        }
      } else if (this.selectedOperatingMode === this.manualMode) {
        this.$store.commit(
          'serverBootSettings/setAutomaticRetryConfigValue',
          'Disabled'
        );
        this.$store.commit(
          'serverBootSettings/setStopBootOnFaultValue',
          'AnyFault'
        );
        this.$store.commit(
          'serverBootSettings/setPowerRestorePolicyValue',
          'AlwaysOff'
        );
      }
    },
  },
};
</script>
