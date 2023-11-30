<template>
  <b-container fluid="xl">
    <page-title />
    <b-row class="mb-4">
      <b-col md="12">
        <page-section
          :sectionTitle="t('pageVirtualMedia.virtualMediaSubTitleFirst')"
        >
          <b-row>
            <b-col v-for="(dev, $index) in proxyDevices" :key="$index" md="6">
              <b-form-group :label="dev.id" label-class="bold">
                <form-file
                  v-if="!dev.isActive"
                  :id="concatId(dev.id)"
                  v-model="dev.file"
                >
                  <template #invalid>
                    <b-form-invalid-feedback role="alert">
                      {{ t('global.form.required') }}
                    </b-form-invalid-feedback>
                  </template>
                </form-file>
              </b-form-group>
              <b-button
                v-if="!dev.isActive"
                variant="primary"
                :disabled="dev.file"
                @click="startVM(dev)"
              >
                {{ t('pageVirtualMedia.start') }}
              </b-button>
              <b-button
                v-if="dev.isActive"
                variant="primary"
                :disabled="!dev.file"
                @click="stopVM(dev)"
              >
                {{ t('pageVirtualMedia.stop') }}
              </b-button>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <b-row class="mb-4">
      <b-col md="12">
        <page-section
          :section-title="t('pageVirtualMedia.virtualMediaSubTitleSecond')"
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
                  {{ t('pageVirtualMedia.configureConnection') }}
                </b-button>

                <b-button
                  v-if="!device.isActive"
                  variant="primary"
                  class="float-right"
                  :disabled="!device.serverUri"
                  @click="startLegacy(device)"
                >
                  {{ t('pageVirtualMedia.start') }}
                </b-button>
                <b-button
                  v-if="device.isActive"
                  variant="primary"
                  class="float-right"
                  @click="stopLegacy(device)"
                >
                  {{ t('pageVirtualMedia.stop') }}
                </b-button>
              </b-form-group>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
    </b-row>
    <!-- <modal-configure-connection
      :connection="modalConfigureConnectionData"
      @ok="saveConnection"
    /> -->
  </b-container>
</template>

<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import { useI18n } from 'vue-i18n';
import PageSection from '@/components/Global/PageSection.vue';
// import BVToastMixin from '@/components/Mixins/BVToastMixin';
// import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
// import ModalConfigureConnection from './ModalConfigureConnection.vue';
import { computed, reactive, ref, watch } from 'vue';
// import NbdServer from '@/utilities/NBDServer';
// import FormFile from '@/components/Global/FormFile';
import { GlobalStore } from '../../../store/modules/GlobalStore';
import { VirtualMediaStore } from '../../../store/modules/Operations/VirtualMediaStore';
const globalStore = GlobalStore();
const virtualMediaStore = VirtualMediaStore();
const { t } = useI18n();
// globalStore.getSystemInfo();
let modalConfigureConnectionData = reactive(null);
const loadImageFromExternalServer = ref(
  import.meta.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true' ? true : true
);
const virtualMedia = import.meta.env.VUE_APP_VIRTUAL_MEDIA_LIST_ENABLED;
console.log('virtualMedia', virtualMedia);
console.log('loadImageFromExternalServer', loadImageFromExternalServer.value);
const proxyDevices = computed(() => {
  console.log(
    'virtualMediaStore.proxyDevices',
    typeof virtualMediaStore.proxyDevices
  );
  return virtualMediaStore.proxyDevices;
});
const legacyDevices = computed(() => {
  virtualMediaStore.legacyDevices;
});
watch(proxyDevices, (newValue, oldValue) => {
  console.log('proxyDevices watch newValue', newValue);
  console.log('proxyDevices watch oldValue', oldValue);
});
// console.log('proxyDevices', proxyDevices);

// if (proxyDevices.length > 0 || legacyDevices.length > 0) {
//   return;
// }
// this.startLoader();

virtualMediaStore.getData();

const startVM = (device) => {
  const token = this.$store.getters['authentication/token'];
  device.nbd = new NbdServer(
    `wss://${window.location.host}${device.websocket}`,
    device.file,
    device.id,
    token
  );
  device.nbd.socketStarted = () =>
    this.successToast(this.t('pageVirtualMedia.toast.serverRunning'));
  device.nbd.errorReadingFile = () =>
    this.errorToast(this.t('pageVirtualMedia.toast.errorReadingFile'));
  device.nbd.socketClosed = (code) => {
    if (code === 1000)
      this.successToast(
        this.t('pageVirtualMedia.toast.serverClosedSuccessfully')
      );
    else
      this.errorToast(this.t('pageVirtualMedia.toast.serverClosedWithErrors'));
    device.file = null;
    device.isActive = false;
  };

  device.nbd.start();
  device.isActive = true;
};
const stopVM = (device) => {
  device.nbd.stop();
};
// const startLegacy = (connectionData) => {
//   var data = {};
//   data.Image = connectionData.serverUri;
//   data.UserName = connectionData.username;
//   data.Password = connectionData.password;
//   data.WriteProtected = !connectionData.isRW;
//   this.startLoader();
//   this.$store
//     .dispatch('virtualMedia/mountImage', {
//       id: connectionData.id,
//       data: data,
//     })
//     .then(() => {
//       this.successToast(
//         this.t('pageVirtualMedia.toast.serverConnectionEstablished')
//       );
//       connectionData.isActive = true;
//     })
//     .catch(() => {
//       this.errorToast(this.t('pageVirtualMedia.toast.errorMounting'));
//       this.isActive = false;
//     })
//     .finally(() => this.endLoader());
// };
// const stopLegacy = (connectionData) => {
//   this.$store
//     .dispatch('virtualMedia/unmountImage', connectionData.id)
//     .then(() => {
//       this.successToast(
//         this.t('pageVirtualMedia.toast.serverClosedSuccessfully')
//       );
//       connectionData.isActive = false;
//     })
//     .catch(() =>
//       this.errorToast(this.t('pageVirtualMedia.toast.errorUnmounting'))
//     )
//     .finally(() => this.endLoader());
// };
// const saveConnection = (connectionData) => {
//   modalConfigureConnectionData.serverUri = connectionData.serverUri;
//   modalConfigureConnectionData.username = connectionData.username;
//   modalConfigureConnectionData.password = connectionData.password;
//   modalConfigureConnectionData.isRW = connectionData.isRW;
// };
// const configureConnection = (connectionData) => {
//   modalConfigureConnectionData = connectionData;
//   this.$bvModal.show('configure-connection');
// };
const concatId = (val) => {
  return val.split(' ').join('_').toLowerCase();
};
</script>
