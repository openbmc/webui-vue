<template>
  <BContainer fluid="xl">
    <page-title />
    <BRow class="mb-4">
      <BCol md="12">
        <page-section
          :section-title="t('pageVirtualMedia.virtualMediaSubTitleFirst')"
        >
          <BRow>
            <BCol v-for="(dev, $index) in proxyDevices" :key="$index" md="6">
              <BFormGroup class="form-group" :label="dev.id" label-class="bold">
                <form-file
                  v-if="!dev.isActive"
                  :id="concatId(dev.id)"
                  v-model="dev.file"
                  @input="fileInput(dev, $index)"
                >
                  <template #invalid>
                    <BFormInvalidFeedback role="alert">
                      {{ t('global.form.required') }}
                    </BFormInvalidFeedback>
                  </template>
                </form-file>
              </BFormGroup>
              <BButton
                class="btn-primary"
                v-if="!dev.isActive"
                @click="startVM(dev)"
              >
                {{ t('pageVirtualMedia.start') }}
              </BButton>
              <BButton
                v-if="dev.isActive"
                variant="primary"
                :disabled="!dev.file"
                @click="stopVM(dev)"
              >
                {{ t('pageVirtualMedia.stop') }}
              </BButton>
            </BCol>
          </BRow>
        </page-section>
      </BCol>
    </BRow>
    <BRow v-if="loadImageFromExternalServer" class="mb-4">
      <BCol md="12">
        <page-section
          :section-title="t('pageVirtualMedia.virtualMediaSubTitleSecond')"
        >
          <BRow>
            <BCol
              v-for="(device, $index) in legacyDevices"
              :key="$index"
              md="6"
            >
              <BFormGroup
                :label="device.id"
                :label-for="device.id"
                label-class="bold"
              >
                <BButton
                  variant="primary"
                  :disabled="device.isActive"
                  @click="configureConnection(device)"
                >
                  {{ t('pageVirtualMedia.configureConnection') }}
                </BButton>

                <BButton
                  v-if="!device.isActive"
                  variant="primary"
                  class="float-right"
                  :disabled="!device.serverUri"
                  @click="startLegacy(device)"
                >
                  {{ t('pageVirtualMedia.start') }}
                </BButton>
                <BButton
                  v-if="device.isActive"
                  variant="primary"
                  class="float-right"
                  @click="stopLegacy(device)"
                >
                  {{ t('pageVirtualMedia.stop') }}
                </BButton>
              </BFormGroup>
            </BCol>
          </BRow>
        </page-section>
      </BCol>
    </BRow>
    <!-- <modal-configure-connection
      :connection="modalConfigureConnectionData"
      @ok="saveConnection"
    /> -->
  </BContainer>
</template>

<script setup>
import PageTitle from '@/components/Global/PageTitle.vue';
import { useI18n } from 'vue-i18n';
import i18n from '@/i18n';
import PageSection from '@/components/Global/PageSection.vue';
// import BVToastMixin from '@/components/Mixins/BVToastMixin';
// import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
// import ModalConfigureConnection from './ModalConfigureConnection.vue';
import { computed, reactive, ref, watch } from 'vue';
import NbdServer from '@/utilities/NBDServer';
import FormFile from '@/components/Global/FormFile.vue';
import { VirtualMediaStore } from '../../../store/modules/Operations/VirtualMediaStore';
import { AuthenticationStore } from '../../../store/modules/Authentication/AuthenticationStore';
const virtualMediaStore = VirtualMediaStore();
const authenticationStore = AuthenticationStore();
const { t } = useI18n();
const proxyDevFile = ref(null);
let modalConfigureConnectionData = reactive(null);
const loadImageFromExternalServer = ref(
  import.meta.env.VITE_APP_VIRTUAL_MEDIA_LIST_ENABLED === 'true' ? true : true
);

const proxyDevices = computed(() => {
  return virtualMediaStore.$state.proxyDevices;
});
const legacyDevices = computed(() => {
  virtualMediaStore.$state.legacyDevices;
});
if (!(proxyDevices.length > 0 || legacyDevices.length > 0)) {
  virtualMediaStore.getData();
}
// this.startLoader();

const startVM = (device) => {
  if (device.file) {
    const token = authenticationStore.token;
    device.nbd = new NbdServer(
      `wss://${window.location.host}${device.websocket}`,
      device.file,
      device.id,
      token
    );
    device.nbd.socketStarted = () => console.log('serverRunning');
    // this.successToast(i18n.global.t('pageVirtualMedia.toast.serverRunning'));
    device.nbd.errorReadingFile = () => console.log('errorReadingFile');
    // this.errorToast(i18n.global.t('pageVirtualMedia.toast.errorReadingFile'));
    device.nbd.socketClosed = (code) => {
      if (code === 1000) console.log('serverClosedSuccessfully');
      // this.successToast(
      //   i18n.global.t('pageVirtualMedia.toast.serverClosedSuccessfully')
      // );
      else console.log('serverClosedSuccessfully');
      // this.errorToast(i18n.global.t('pageVirtualMedia.toast.serverClosedWithErrors'));
      device.file = null;
      device.isActive = false;
    };

    device.nbd.start();
    device.isActive = true;
  }
};
const stopVM = (device) => {
  device.nbd.stop();
};
const fileInput = (file, index) => {
  console.log('virtual media file', file);
  console.log('virtual media index', index);
  // proxyDevices[0].file = file;
};
const startLegacy = (connectionData) => {
  var data = ref(null);
  data.Image = connectionData.serverUri;
  data.UserName = connectionData.username;
  data.Password = connectionData.password;
  data.WriteProtected = !connectionData.isRW;
  // this.startLoader();
  virtualMediaStore
    .mountImage({
      id: connectionData.id,
      data: data,
    })
    .then(() => {
      // this.successToast(
      //   this.t('pageVirtualMedia.toast.serverConnectionEstablished')
      // );
      connectionData.isActive = true;
    })
    .catch(() => {
      // this.errorToast(this.t('pageVirtualMedia.toast.errorMounting'));
    });
  // .finally(() => this.endLoader());
};
const stopLegacy = (connectionData) => {
  virtualMediaStore.unmountImage(connectionData.id).then(() => {
    // this.successToast(
    //   this.t('pageVirtualMedia.toast.serverClosedSuccessfully')
    // );
    connectionData.isActive = false;
  });
  // .catch(() =>
  //   this.errorToast(this.t('pageVirtualMedia.toast.errorUnmounting'))
  // )
  // .finally(() => this.endLoader());
};
const saveConnection = (connectionData) => {
  modalConfigureConnectionData.serverUri = connectionData.serverUri;
  modalConfigureConnectionData.username = connectionData.username;
  modalConfigureConnectionData.password = connectionData.password;
  modalConfigureConnectionData.isRW = connectionData.isRW;
};
const configureConnection = (connectionData) => {
  modalConfigureConnectionData = connectionData;
  // this.$bvModal.show('configure-connection');
};
const concatId = (val) => {
  return val.split(' ').join('_').toLowerCase();
};
</script>
