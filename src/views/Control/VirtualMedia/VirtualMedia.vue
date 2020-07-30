<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="mb-4">
      <b-col md="12">
        <page-section
          :section-title="$t('pageVirtualMedia.virtualMediaSubTitleFirst')"
        >
          <b-row>
            <b-col v-for="(dev, $index) in proxyDevices" :key="$index" md="6">
              <b-form-group
                :label="dev.id"
                :label-for="dev.id"
                label-class="bold"
              >
                <b-form-file
                  v-show="!dev.isActive"
                  :id="dev.id"
                  v-model="dev.file"
                />
                <p v-if="dev.isActive">{{ dev.file.name }}</p>
              </b-form-group>
              <b-button
                v-if="!dev.isActive"
                variant="primary"
                :disabled="!dev.file"
                @click="startVM(dev)"
              >
                {{ 'Start' }}
              </b-button>
              <b-button
                v-if="dev.isActive"
                variant="primary"
                :disabled="!dev.file"
                @click="stopVM(dev)"
              >
                {{ 'Stop' }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row class="mb-4">
      <b-col md="12">
        <page-section
          :section-title="$t('pageVirtualMedia.virtualMediaSubTitleSecond')"
        >
          <b-row>
            <b-col
              v-for="(device, $index) in legacyDevices"
              :key="$index"
              md="6"
            >
              <b-form-group
                :label="device.id"
                :label-for="device.id"
                label-class="bold"
              >
                <b-button variant="primary" @click="configureConnection()">
                  {{ $t('pageVirtualMedia.configureConnection') }}
                </b-button>

                <b-button
                  variant="primary"
                  class="right"
                  :disabled="!device.address"
                  @click="startLegacy(device)"
                >
                  {{ 'Start' }}
                </b-button>
              </b-form-group>
            </b-col>
          </b-row>
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
import NbdServer from '@/store/plugins/NBDServer';

export default {
  name: 'VirtualMedia',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin, LoadingBarMixin],
  computed: {
    proxyDevices() {
      return this.$store.getters['virtualMedia/proxyDevices'];
    },
    legacyDevices() {
      return this.$store.getters['virtualMedia/legacyDevices'];
    }
  },
  created() {
    if (this.proxyDevices.length > 0 || this.legacyDevices.length > 0) return;
    this.startLoader();
    this.$store
      .dispatch('virtualMedia/getData')
      .finally(() => this.endLoader());
  },
  methods: {
    startVM(device) {
      const token = this.$store.getters['authentication/token'];
      device.nbd = new NbdServer(
        `wss://${window.location.host}${device.websocket}`,
        device.file,
        device.id,
        token
      );
      device.nbd.socketStarted = () =>
        this.successToast(this.$t('pageVirtualMedia.toast.serverRunning'));
      device.nbd.errorReadingFile = () =>
        this.errorToast(this.$t('pageVirtualMedia.toast.errorReadingFile'));
      device.nbd.socketClosed = code => {
        if (code === 1000)
          this.successToast(
            this.$t('pageVirtualMedia.toast.serverClosedSuccessfully')
          );
        else
          this.errorToast(
            this.$t('pageVirtualMedia.toast.serverClosedWithErrors')
          );
        device.file = null;
        device.isActive = false;
      };

      device.nbd.start();
      device.isActive = true;
    },
    stopVM(device) {
      device.nbd.stop();
    },
    startLegacy() {
      console.log('starting legacy...');
    },
    configureConnection() {
      this.warningToast('This option is unavialable. We are working on it.');
    }
  }
};
</script>

<style lang="scss" scoped>
.right {
  float: right;
}
</style>
