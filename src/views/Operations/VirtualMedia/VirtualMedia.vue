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
              <b-form-group :label="dev.id" label-class="bold">
                <!-- File input - only show when not active -->
                <form-file
                  v-if="!dev.isActive"
                  :id="concatId(dev.id)"
                  v-model="dev.file"
                >
                  <template #invalid>
                    <b-form-invalid-feedback role="alert">
                      {{ $t('global.form.required') }}
                    </b-form-invalid-feedback>
                  </template>
                </form-file>

                <!-- Display image name when active in this session -->
                <div
                  v-if="dev.isActive && dev.file"
                  class="active-image-name"
                >
                  <span class="text-break">{{ dev.file.name }}</span>
                </div>

                <!-- Device active from another session (e.g. after refresh) -->
                <div
                  v-if="dev.isActive && !dev.nbd"
                  class="active-external-session"
                >
                  {{ $t('pageVirtualMedia.activeExternalSession') }}
                </div>
              </b-form-group>

              <!-- Start button - only show when not active -->
              <b-button
                v-if="!dev.isActive"
                variant="primary"
                :disabled="!dev.file"
                @click="startVM(dev)"
              >
                {{ $t('pageVirtualMedia.start') }}
              </b-button>

              <!-- Stop button - browser-owned nbd -->
              <b-button
                v-if="dev.isActive && dev.nbd"
                variant="primary"
                @click="stopVM(dev)"
              >
                {{ $t('pageVirtualMedia.stop') }}
              </b-button>

              <!-- Stop button - Redfish eject for externally-active devices -->
              <b-button
                v-if="dev.isActive && !dev.nbd"
                variant="primary"
                @click="stopProxyExternal(dev)"
              >
                {{ $t('pageVirtualMedia.stop') }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row v-if="loadImageFromExternalServer" class="mb-4">
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
                <b-button
                  variant="primary"
                  :disabled="device.isActive"
                  @click="configureConnection(device)"
                >
                  {{ $t('pageVirtualMedia.configureConnection') }}
                </b-button>

                <b-button
                  v-if="!device.isActive"
                  variant="primary"
                  class="float-end"
                  :disabled="!device.serverUri"
                  @click="startLegacy(device)"
                >
                  {{ $t('pageVirtualMedia.start') }}
                </b-button>
                <b-button
                  v-if="device.isActive"
                  variant="primary"
                  class="float-end"
                  @click="stopLegacy(device)"
                >
                  {{ $t('pageVirtualMedia.stop') }}
                </b-button>
              </b-form-group>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <modal-configure-connection
      v-model="showConfigureConnectionModal"
      :connection="modalConfigureConnection"
      @ok="saveConnection"
    />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import ModalConfigureConnection from './ModalConfigureConnection';
import NbdServer from '@/utilities/NBDServer';
import FormFile from '@/components/Global/FormFile';
import i18n from '@/i18n';
import { useModal } from 'bootstrap-vue-next';

export default {
  name: 'VirtualMedia',
  components: { PageTitle, PageSection, ModalConfigureConnection, FormFile },
  mixins: [BVToastMixin, LoadingBarMixin],
  setup() {
    const bvModal = useModal();
    return { bvModal };
  },
  data() {
    return {
      modalConfigureConnection: null,
      showConfigureConnectionModal: false,
      loadImageFromExternalServer:
        import.meta.env.VITE_VIRTUAL_MEDIA_LIST_ENABLED === 'true'
          ? true
          : false,
    };
  },
  computed: {
    proxyDevices() {
      return this.$store.getters['virtualMedia/proxyDevices'];
    },
    legacyDevices() {
      return this.$store.getters['virtualMedia/legacyDevices'];
    },
  },
  created() {
    this.$store.dispatch('global/getSystemInfo');
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
        token,
      );
      device.nbd.socketStarted = () => {
        this.successToast(
          i18n.global.t('pageVirtualMedia.toast.serverRunning'),
        );
        // Mark device as active in store
        this.$store.commit('virtualMedia/setDeviceActive', {
          deviceId: device.id,
          isActive: true,
        });
      };
      device.nbd.errorReadingFile = () =>
        this.errorToast(
          i18n.global.t('pageVirtualMedia.toast.errorReadingFile'),
        );
      device.nbd.socketClosed = (code) => {
        if (code === 1000)
          this.successToast(
            i18n.global.t('pageVirtualMedia.toast.serverClosedSuccessfully'),
          );
        else
          this.errorToast(
            i18n.global.t('pageVirtualMedia.toast.serverClosedWithErrors'),
          );
        // Clear state and mark as inactive
        device.file = null;
        device.nbd = null;
        this.$store.commit('virtualMedia/setDeviceActive', {
          deviceId: device.id,
          isActive: false,
        });
      };

      device.nbd.start();
    },
    stopVM(device) {
      if (!device.nbd) return;
      device.nbd.stop();
    },
    stopProxyExternal(device) {
      this.startLoader();
      this.$store
        .dispatch('virtualMedia/unmountImage', device.id)
        .then(() => {
          this.successToast(
            i18n.global.t('pageVirtualMedia.toast.serverClosedSuccessfully'),
          );
          this.$store.commit('virtualMedia/setDeviceActive', {
            deviceId: device.id,
            isActive: false,
          });
        })
        .catch(() => {
          this.errorToast(
            i18n.global.t('pageVirtualMedia.toast.errorUnmounting'),
          );
        })
        .finally(() => this.endLoader());
    },
    startLegacy(connectionData) {
      var data = {};
      data.Image = connectionData.serverUri;
      data.UserName = connectionData.username;
      data.Password = connectionData.password;
      data.WriteProtected = !connectionData.isRW;
      this.startLoader();
      this.$store
        .dispatch('virtualMedia/mountImage', {
          id: connectionData.id,
          data: data,
        })
        .then(() => {
          this.successToast(
            i18n.global.t('pageVirtualMedia.toast.serverConnectionEstablished'),
          );
          connectionData.isActive = true;
        })
        .catch(() => {
          this.errorToast(
            i18n.global.t('pageVirtualMedia.toast.errorMounting'),
          );
        })
        .finally(() => this.endLoader());
    },
    stopLegacy(connectionData) {
      this.$store
        .dispatch('virtualMedia/unmountImage', connectionData.id)
        .then(() => {
          this.successToast(
            i18n.global.t('pageVirtualMedia.toast.serverClosedSuccessfully'),
          );
          connectionData.isActive = false;
        })
        .catch(() =>
          this.errorToast(
            i18n.global.t('pageVirtualMedia.toast.errorUnmounting'),
          ),
        )
        .finally(() => this.endLoader());
    },
    saveConnection(connectionData) {
      this.modalConfigureConnection.serverUri = connectionData.serverUri;
      this.modalConfigureConnection.username = connectionData.username;
      this.modalConfigureConnection.password = connectionData.password;
      this.modalConfigureConnection.isRW = connectionData.isRW;
    },
    configureConnection(connectionData) {
      this.modalConfigureConnection = connectionData;
      this.showConfigureConnectionModal = true;
    },
    concatId(val) {
      return val.split(' ').join('_').toLowerCase();
    },
  },
};
</script>

<style lang="scss" scoped>
.active-image-name {
  display: flex;
  align-items: center;
  background-color: var(--bs-light, #f8f9fa);
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;

  span {
    font-weight: 500;
    overflow-wrap: break-word;
  }
}

.active-external-session {
  color: var(--bs-secondary, #6c757d);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>
