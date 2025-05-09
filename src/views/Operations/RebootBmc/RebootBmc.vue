<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" lg="8" xl="6">
        <page-section>
          <b-row>
            <b-col>
              <dl>
                <dt>
                  {{ $t('pageRebootBmc.lastReboot') }}
                </dt>
                <dd v-if="lastBmcRebootTime">
                  {{ $filters.formatDate(lastBmcRebootTime) }}
                  {{ $filters.formatTime(lastBmcRebootTime) }}
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
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      $t: useI18n().t,
    };
  },
  computed: {
    lastBmcRebootTime() {
      return this.$store.getters['controls/lastBmcRebootTime'];
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('controls/getLastBmcRebootTime')
      .finally(() => this.endLoader());
  },
  methods: {
    onClick() {
      this.$bvModal
        .msgBoxConfirm(i18n.global.t('pageRebootBmc.modal.confirmMessage'), {
          title: i18n.global.t('pageRebootBmc.modal.confirmTitle'),
          okTitle: i18n.global.t('global.action.confirm'),
          cancelTitle: i18n.global.t('global.action.cancel'),
          autoFocusButton: 'ok',
        })
        .then((confirmed) => {
          if (confirmed) this.rebootBmc();
        });
    },
    rebootBmc() {
      this.$store
        .dispatch('controls/rebootBmc')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/assets/styles/bmc/helpers/_index.scss';
@import '@/assets/styles/bootstrap/_helpers.scss';
</style>
