<template>
  <overview-card
    :title="$t('pageOverview.serverInformation')"
    :to="`/hardware-status/inventory`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.model') }}</dt>
          <dd>{{ dataFormatter(serverModel) }}</dd>
          <dt>{{ $t('pageOverview.serialNumber') }}</dt>
          <dd>{{ dataFormatter(serverSerialNumber) }}</dd>
          <dt>
            {{ $t('pageOverview.assetTag') }}
            <b-button variant="link" class="p-1" @click="initAssetTagModal()">
              <icon-edit :title="$t('pageOverview.modal.editAssetTag')" />
            </b-button>
          </dt>
          <dd :title="assetTag">{{ dataFormatter(assetTag) }}</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.serverManufacturer') }}</dt>
          <dd>{{ dataFormatter(serverManufacturer) }}</dd>
        </dl>
      </b-col>
    </b-row>
    <modal-asset-tag v-model="showAssetTagModal" :tag="assetTag" @ok="saveAssetTag" />
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import { mapState } from 'vuex';
import ModalAssetTag from './ModalAssetTag.vue';
import IconEdit from '@carbon/icons-vue/es/edit/16';

export default {
  name: 'Server',
  components: {
    OverviewCard,
    IconEdit,
    ModalAssetTag,
  },
  mixins: [DataFormatterMixin, BVToastMixin, LoadingBarMixin],
  data() {
    return {
      showAssetTagModal: false,
    };
  },
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      serverModel() {
        return this.server?.model;
      },
      assetTag() {
        return this.$store.getters['global/assetTag'];
      },
      serverSerialNumber() {
        return this.server?.serialNumber;
      },
      serverManufacturer() {
        return this.server?.manufacturer;
      },
    }),
  },
  created() {
    this.$store.dispatch('system/getSystem').finally(() => {
      this.$eventBus.$emit('overview-server-complete');
    });
  },
  methods: {
    initAssetTagModal() {
      this.showAssetTagModal = true;
    },
    saveAssetTag(modalFormData) {
      this.startLoader();
      this.$store
        .dispatch('system/saveAssetTag', modalFormData)
        .then((message) => {
          this.$store.dispatch('global/getSystemInfo');
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  }
};
</script>
