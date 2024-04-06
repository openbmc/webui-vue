<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageKeyClear.description')" />
    <b-row>
      <b-col md="8" xl="6">
        <alert variant="info" class="mb-4">
          <div class="font-weight-bold">
            {{ $t('pageKeyClear.alert.title') }}
          </div>
          <div>
            {{ $t('pageKeyClear.alert.description') }}
          </div>
        </alert>
      </b-col>
    </b-row>
    <!-- Reset Form -->
    <b-form id="key-clear" @submit.prevent="onKeyClearSubmit(keyOption)">
      <b-row>
        <b-col md="8">
          <b-form-group :label="$t('pageKeyClear.form.keyClearOptionsLabel')">
            <b-form-radio-group
              id="key-clear-options"
              v-model="keyOption"
              stacked
            >
              <b-form-radio class="mb-1" value="NONE">
                {{ $t('pageKeyClear.form.none') }}
              </b-form-radio>
              <b-form-text id="key-clear-not-requested" class="ml-4 mb-3">
                {{ $t('pageKeyClear.form.keyClearNotRequested') }}
              </b-form-text>
              <b-form-radio class="mb-1" value="ALL">
                {{ $t('pageKeyClear.form.clearAllLabel') }}
              </b-form-radio>
              <b-form-text id="clear-all" class="ml-4 mb-3">
                {{ $t('pageKeyClear.form.clearAllHeperText') }}
              </b-form-text>
              <b-form-radio class="mb-1" value="POWERVM_SYSKEY">
                {{ $t('pageKeyClear.form.clearHypervisorSystemKeyLabel') }}
              </b-form-radio>
              <b-form-text id="clear-hypervisor-key" class="ml-4 mb-3">
                {{ $t('pageKeyClear.form.clearHypervisorSystemKeyHelperText') }}
              </b-form-text>
              <template v-if="username == 'service'">
                <b-form-radio class="mb-1" value="MFG_ALL">
                  {{ $t('pageKeyClear.form.clearAllSetGenesisIPL') }}
                </b-form-radio>
                <b-form-radio class="mb-1" value="MFG">
                  {{ $t('pageKeyClear.form.setFactoryDefault') }}
                </b-form-radio>
              </template>
            </b-form-radio-group>
          </b-form-group>
          <b-button
            type="submit"
            variant="primary"
            data-test-id="keyClear-button-submit"
          >
            {{ $t('pageKeyClear.form.clear') }}
          </b-button>
        </b-col>
      </b-row>
    </b-form>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import Alert from '@/components/Global/Alert';

export default {
  name: 'KeyClear',
  components: { PageTitle, Alert },
  mixins: [LoadingBarMixin, BVToastMixin],
  data() {
    return {
      keyOption: 'NONE',
      username: this.$store.getters['global/username'],
    };
  },
  created() {
    this.hideLoader();
  },
  methods: {
    onKeyClearSubmit(valueSelected) {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageKeyClear.modal.clearAllMessage'), {
          title: this.$t('pageKeyClear.modal.clearAllTitle'),
          okTitle: this.$t('pageKeyClear.modal.clear'),
          okVariant: 'danger',
          cancelTitle: this.$t('global.action.cancel'),
          autoFocusButton: 'cancel',
        })
        .then((clearConfirmed) => {
          if (clearConfirmed) {
            this.$store
              .dispatch('keyClear/clearEncryptionKeys', valueSelected)
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
  },
};
</script>
