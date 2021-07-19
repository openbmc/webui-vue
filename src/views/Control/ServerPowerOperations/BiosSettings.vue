<template>
  <div class="bios-form-background">
    <div>
      {{
        $t('pageServerPowerOperations.biosSettings.pvm_system_operating_mode')
      }}
      <b-row>
        <b-col sm="8" md="6" xl="12">
          <b-form-group
            :label="$t('pagePowerRestorePolicy.powerPoliciesLabel')"
          >
            <b-form-radio
              v-for="policy in powerRestorePolicies"
              :key="policy.state"
              v-model="currentPowerRestorePolicy"
              :value="policy.state"
              name="power-restore-policy"
            >
              {{ policy.desc }}
            </b-form-radio>
          </b-form-group>
        </b-col>
      </b-row>
    </div>
    <template v-for="(attriValuesArr, key) of attributeValues">
      <b-form-group
        :key="key"
        :label="$t(`${'pageServerPowerOperations.biosSettings'}.${key}`)"
        class="mb-4"
      >
        <b-form-select
          v-if="
            attriValuesArr.length > 2 && key !== 'pvm_system_power_off_policy'
          "
          id="bios-option-sysOp-mode"
          :value="attributeKeys[key]"
          :options="attriValuesArr"
          @change="updateAttributeKeys(key, $event)"
        >
        </b-form-select>
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
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'BiosSettings',
  mixins: [LoadingBarMixin],
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
      policyValue: null,
      attributeKeys: { ...this.attributes },
    };
  },
  computed: {
    powerRestorePolicies() {
      return this.$store.getters['powerPolicy/powerRestorePolicies'];
    },
    currentPowerRestorePolicy: {
      get() {
        return this.$store.getters['powerPolicy/powerRestoreCurrentPolicy'];
      },
      set(policy) {
        this.policyValue = policy;
      },
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('powerPolicy/getPowerRestorePolicies'),
      this.$store.dispatch('powerPolicy/getPowerRestoreCurrentPolicy'),
    ]).finally(() => this.endLoader());
  },
  methods: {
    onChangeSystemOpsMode(value) {
      if (value === 'Manual') {
        this.$store.dispatch('serverBootSettings/updateManualSetting', {
          PowerRestorePolicy: 'AlwaysOff',
          Boot: { AutomaticRetryConfig: 'Disabled' },
        });
      }
    },
    updateAttributeKeys() {
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
