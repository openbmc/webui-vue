<template>
  <div class="form-background p-3">
    <b-form novalidate @submit.prevent="handleSubmit">
      <b-form-group
        :label="
          $t('pageServerPowerOperations.bootSettings.bootSettingsOverride')
        "
        label-for="boot-option"
        class="mb-3"
      >
        <b-form-select
          id="boot-option"
          v-model="form.bootOption"
          :disabled="bootSourceOptions.length === 0"
          :options="bootSourceOptions"
          @change="onChangeSelect"
        >
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

      <bios-settings
        v-if="form.attributes && form.attributeValues"
        :attributes="form.attributes"
        :attribute-values="form.attributeValues"
        @updated-attributes="updateAttributeKeys"
      />

      <b-form-group
        :label="$t('pageServerPowerOperations.bootSettings.tpmRequiredPolicy')"
      >
        <b-form-text id="tpm-required-policy-help-block">
          {{
            $t('pageServerPowerOperations.bootSettings.tpmRequiredPolicyHelper')
          }}
        </b-form-text>
        <b-form-checkbox
          id="tpm-required-policy"
          v-model="form.tpmPolicyOn"
          aria-describedby="tpm-required-policy-help-block"
          @change="$v.form.tpmPolicyOn.$touch()"
        >
          {{ $t('global.status.enabled') }}
        </b-form-checkbox>
      </b-form-group>
      <b-button variant="primary" type="submit" class="mb-3">
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BiosSettings from './BiosSettings';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'BootSettings',
  components: { BiosSettings },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      form: {
        bootOption: this.$store.getters['hostBootSettings/bootSource'],
        oneTimeBoot: this.$store.getters['hostBootSettings/overrideEnabled'],
        tpmPolicyOn: this.$store.getters['hostBootSettings/tpmEnabled'],
        attributes: this.$store.getters['hostBootSettings/biosAttributes'],
        attributeValues: this.$store.getters[
          'hostBootSettings/attributeValues'
        ],
      },
    };
  },
  computed: {
    ...mapState('hostBootSettings', [
      'attributeValues',
      'biosAttributes',
      'bootSourceOptions',
      'bootSource',
      'overrideEnabled',
      'tpmEnabled',
    ]),
  },
  watch: {
    attributeValues: function (value) {
      this.form.attributeValues = value;
    },
    biosAttributes: function (value) {
      this.form.attributes = value;
    },
    bootSource: function (value) {
      this.form.bootOption = value;
    },
    overrideEnabled: function (value) {
      this.form.oneTimeBoot = value;
    },
    tpmEnabled: function (value) {
      this.form.tpmPolicyOn = value;
    },
  },
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    form: {
      bootOption: {},
      oneTimeBoot: {},
      tpmPolicyOn: {},
    },
  },
  created() {
    Promise.all([
      this.$store.dispatch('hostBootSettings/getBootSettings'),
      this.$store.dispatch('hostBootSettings/getBiosAttributes'),
      this.$store.dispatch('hostBootSettings/getAttributeValues'),
      this.$store.dispatch('hostBootSettings/getTpmPolicy'),
    ]).finally(() =>
      this.$root.$emit('server-power-operations-boot-settings-complete')
    );
  },
  methods: {
    updateAttributeKeys(attributeKeys) {
      this.form.attributes = attributeKeys;
    },
    handleSubmit() {
      this.startLoader();
      const bootSettingsChanged =
        this.$v.form.bootOption.$dirty || this.$v.form.oneTimeBoot.$dirty;
      const tpmPolicyChanged = this.$v.form.tpmPolicyOn.$dirty;
      let settings;
      let bootSource = null;
      let overrideEnabled = null;
      let tpmEnabled = null;
      let biosSettings = this.form.attributes;
      if (bootSettingsChanged) {
        // If bootSource or overrideEnabled changed get
        // both current values to send with request
        bootSource = this.form.bootOption;
        overrideEnabled = this.form.oneTimeBoot;
      }
      if (tpmPolicyChanged) tpmEnabled = this.form.tpmPolicyOn;
      settings = { bootSource, overrideEnabled, tpmEnabled, biosSettings };
      this.$store
        .dispatch('hostBootSettings/saveSettings', settings)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    onChangeSelect(selectedOption) {
      this.$v.form.bootOption.$touch();
      // Disable one time boot if selected boot option is 'None'
      if (selectedOption === 'None') this.form.oneTimeBoot = false;
    },
  },
};
</script>
