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
      <b-button variant="primary" type="submit" class="mb-3">
        {{ $t('global.action.save') }}
      </b-button>
    </b-form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'BootSettings',
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      form: {
        bootOption: this.$store.getters['serverBootSettings/bootSource'],
        oneTimeBoot: this.$store.getters['serverBootSettings/overrideEnabled'],
      },
    };
  },
  computed: {
    ...mapState('serverBootSettings', [
      'bootSourceOptions',
      'bootSource',
      'overrideEnabled',
    ]),
  },
  watch: {
    bootSource: function (value) {
      this.form.bootOption = value;
    },
    overrideEnabled: function (value) {
      this.form.oneTimeBoot = value;
    },
  },
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    form: {
      bootOption: {},
      oneTimeBoot: {},
    },
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      let settings;
      let bootSource = this.form.bootOption;
      let overrideEnabled = this.form.oneTimeBoot;

      settings = { bootSource, overrideEnabled };

      this.$store
        .dispatch('serverBootSettings/saveSettings', settings)
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
