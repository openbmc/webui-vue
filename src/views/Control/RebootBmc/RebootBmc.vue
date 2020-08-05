<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <b-col>
              <dl>
                <dt>Last power operation</dt>
                <dd v-if="lastResetTime">
                  {{ lastResetTime | formatDate }}
                  {{ lastResetTime | formatTime }}
                </dd>
                <dd v-else>--</dd>
              </dl>
            </b-col>
          </b-row>
          {{ $t('pageRebootBmc.rebootInformation') }}
          <b-button
            variant="primary"
            class="d-block mt-5"
            data-test-id="rebootBmc-button-reboot"
            @click="onClick"
          >
            {{ $t('pageRebootBmc.rebootBmc') }}
          </b-button>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';
import BVToastMixin from '../../../components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  computed: {
    lastResetTime() {
      return this.$store.getters['global/lastResetTime'];
    }
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('global/getLastResetTime')
      .finally(() => this.endLoader());
  },
  methods: {
    onClick() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageRebootBmc.modal.confirmMessage'), {
          title: this.$t('pageRebootBmc.modal.confirmTitle'),
          okTitle: this.$t('global.action.confirm')
        })
        .then(confirmed => {
          if (confirmed) this.rebootBmc();
        });
    },
    rebootBmc() {
      this.$store
        .dispatch('controls/rebootBmc')
        .then(message => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    }
  }
};
</script>

<style lang="scss" scoped></style>
