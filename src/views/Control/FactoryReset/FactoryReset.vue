<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageFactoryReset.description')" />

    <!-- Reset Form -->
    <b-form id="factory-reset" @submit.prevent="onResetSubmit">
      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('pageFactoryReset.form.resetOptionsLabel')">
            <b-form-radio-group
              id="factory-reset-options"
              v-model="resetOption"
              stacked
            >
              <b-form-radio
                class="mb-1"
                value="resetBios"
                aria-describedby="reset-bios"
                data-test-id="factoryReset-radio-resetBios"
              >
                {{ $t('pageFactoryReset.form.resetBiosOptionLabel') }}
              </b-form-radio>
              <b-form-text id="reset-bios" class="ml-4 mb-3">
                {{ $t('pageFactoryReset.form.resetBiosOptionHelperText') }}
              </b-form-text>

              <b-form-radio
                class="mb-1"
                value="resetToDefaults"
                aria-describedby="reset-to-defaults"
                data-test-id="factoryReset-radio-resetToDefaults"
              >
                {{ $t('pageFactoryReset.form.resetToDefaultsOptionLabel') }}
              </b-form-radio>
              <b-form-text id="reset-to-defaults" class="ml-4 mb-3">
                {{
                  $t('pageFactoryReset.form.resetToDefaultsOptionHelperText')
                }}
              </b-form-text>
            </b-form-radio-group>
          </b-form-group>
          <b-button
            type="submit"
            variant="primary"
            data-test-id="factoryReset-button-submit"
          >
            {{ $t('global.action.reset') }}
          </b-button>
        </b-col>
      </b-row>
    </b-form>

    <!-- Modals -->
    <modal-reset :reset-type="resetOption" @okConfirm="onOkConfirm" />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalReset from './FactoryResetModal';

export default {
  name: 'FactoryReset',
  components: { PageTitle, ModalReset },
  mixins: [LoadingBarMixin, BVToastMixin],
  data() {
    return {
      resetOption: 'resetBios',
    };
  },
  created() {
    this.hideLoader();
  },
  methods: {
    onResetSubmit() {
      this.$bvModal.show('modal-reset');
    },
    onOkConfirm() {
      if (this.resetOption == 'resetBios') {
        this.onResetBiosConfirm();
      } else {
        this.onResetToDefaultsConfirm();
      }
    },
    onResetBiosConfirm() {
      this.$store
        .dispatch('factoryReset/resetBios')
        .then((title) => {
          this.successToast('', {
            title,
          });
        })
        .catch(({ title }) => {
          this.errorToast({
            title,
          });
        });
    },
    onResetToDefaultsConfirm() {
      this.$store
        .dispatch('factoryReset/resetToDefaults')
        .then((title) => {
          this.successToast('', {
            title,
          });
        })
        .catch(({ title }) => {
          this.errorToast({
            title,
          });
        });
    },
  },
};
</script>
