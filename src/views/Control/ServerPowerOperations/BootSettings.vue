<template>
  <div class="boot-settings p-3">
    <b-form novalidate @submit.prevent="handleSubmit">
      <b-form-group
        :label="
          $t('pageServerPowerOperations.bootSettings.bootSettingsOverride')
        "
        class="mb-3"
      >
        <b-form-select
          v-model="form.bootOption"
          :disabled="bootOptions.length === 0"
          @change="$v.form.bootOption.$touch()"
        >
          <b-form-select-option
            v-for="(option, index) in bootOptions"
            :key="index"
            :value="option"
            :disabled="option === 'None' && form.oneTimeBoot"
          >
            {{ option }}
          </b-form-select-option>
        </b-form-select>
      </b-form-group>
      <b-form-checkbox
        v-model="form.oneTimeBoot"
        class="mb-4"
        :disabled="form.bootOption === 'None'"
        @change="$v.form.oneTimeBoot.$touch()"
      >
        {{ $t('pageServerPowerOperations.bootSettings.enableOneTimeBoot') }}
      </b-form-checkbox>
      <b-form-group
        :label="$t('pageServerPowerOperations.bootSettings.tpmRequiredPolicy')"
        label-for="tpm-required-policy"
      >
        <b-form-text id="tpm-required-policy-help-block">
          {{
            $t('pageServerPowerOperations.bootSettings.tpmRequiredPolicyHelper')
          }}
        </b-form-text>
        <b-form-checkbox
          id="tpm-required-policy"
          v-model="form.tpmPolicyOn"
          switch
          aria-describedby="tpm-required-policy-help-block"
          @change="$v.form.tpmPolicyOn.$touch()"
        >
          {{
            form.tpmPolicyOn ? $t('global.status.on') : $t('global.status.off')
          }}
        </b-form-checkbox>
      </b-form-group>
      <b-button
        variant="primary"
        type="submit"
        class="mb-3"
        :disabled="!$v.form.$anyDirty"
      >
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BVToastMixin from '../../../components/Mixins/BVToastMixin';

export default {
  name: 'BootSettings',
  mixins: [BVToastMixin],
  data() {
    return {
      form: {
        bootOption: null,
        oneTimeBoot: null,
        tpmPolicyOn: null
      }
    };
  },
  computed: {
    ...mapState('hostBootSettings', [
      'bootOptions',
      'bootSource',
      'overrideEnabled',
      'tpmEnabled'
    ])
  },
  watch: {
    bootSource: function(value) {
      this.form.bootOption = value;
    },
    overrideEnabled: function(value) {
      this.form.oneTimeBoot = value;
    },
    tpmEnabled: function(value) {
      this.form.tpmPolicyOn = value;
    }
  },
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    form: {
      bootOption: {},
      oneTimeBoot: {},
      tpmPolicyOn: {}
    }
  },
  created() {
    this.$store.dispatch('hostBootSettings/getBootSettings');
    this.$store.dispatch('hostBootSettings/getTpmPolicy');
  },
  methods: {
    handleSubmit() {
      const bootSettingsChanged =
        this.$v.form.bootOption.$dirty || this.$v.form.oneTimeBoot.$dirty;
      const tpmPolicyChanged = this.$v.form.tpmPolicyOn.$dirty;
      let settings;
      let bootSource = null;
      let overrideEnabled = null;
      let tpmEnabled = null;

      if (bootSettingsChanged) {
        // If bootSource or overrideEnabled changed get
        // both current values to send with request
        bootSource = this.form.bootOption;
        overrideEnabled = this.form.oneTimeBoot;
      }
      if (tpmPolicyChanged) tpmEnabled = this.form.tpmPolicyOn;
      settings = { bootSource, overrideEnabled, tpmEnabled };

      this.$store
        .dispatch('hostBootSettings/saveSettings', settings)
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.boot-settings {
  background-color: $gray-200;
}
</style>
