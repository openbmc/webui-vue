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
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'RebootBmc',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  computed: {
    lastBmcRebootTime() {
      return this.$store.getters['controls/lastBmcRebootTime'];
    },
    bootProgress() {
      return this.$store.getters['global/bootProgress'];
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
      this.$confirm(i18n.global.t('pageRebootBmc.modal.confirmMessage'), {
        title: i18n.global.t('pageRebootBmc.modal.confirmTitle'),
        okTitle: i18n.global.t('global.action.confirm'),
        cancelTitle: i18n.global.t('global.action.cancel'),
        autoFocusButton: 'ok',
      }).then((confirmed) => {
        if (confirmed) this.rebootBmc();
      });
    },
    rebootBmc() {
      this.startLoader();
      this.$store
        .dispatch('controls/rebootBmc')
        .then((message) => {
          // Start checking for BMC reboot completion
          this.checkBmcRebootCompletion(message);
        })
        .catch(({ message }) => {
          this.errorToast(message);
          this.endLoader();
        });
    },
    checkBmcRebootCompletion(message) {
      this.infoToast(message);
      this.startLoader();
      const timer = (checkCounter = 0) => {
        checkCounter++;

        // This counter goes up by 1 every time this function runs
        // If the function successfully goes to last toast, it won't run anymore
        // if this function runs more than 10 times, it won't run anymore
        if (checkCounter > 10) {
          this.endLoader();
          return this.errorToast(message);
        }

        this.$store.dispatch('global/getBootProgress').then(() => {
          if (this.bootProgress) {
            this.infoToast(
              this.$t('pageRebootBmc.toast.successRebootCompleted')
            );
            this.endLoader();
          } else {
            setTimeout(() => {
              timer(checkCounter);
            }, 60000); // 1 minute
          }
        });
      };
      timer();
    },
  },
};
</script>

<style lang="scss" scoped></style>
