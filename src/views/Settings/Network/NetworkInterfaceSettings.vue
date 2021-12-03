<template>
  <div>
    <page-section>
      <b-row>
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.linkStatus') }}</dt>
            <dd>
              {{ dataFormatter(linkStatus) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl>
            <dt>{{ $t('pageNetwork.speed') }}</dt>
            <dd>
              {{ dataFormatter(linkSpeed) }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
    <page-section :section-title="$t('pageNetwork.interfaceSection')">
      <b-row>
        <b-col md="3">
          <dl>
            <dt>
              {{ $t('pageNetwork.fqdn') }}
            </dt>
            <dd>
              {{ dataFormatter(fqdn) }}
            </dd>
          </dl>
        </b-col>
        <b-col md="3">
          <dl class="text-nowrap">
            <dt>
              {{ $t('pageNetwork.macAddress') }}
              <b-button
                variant="link"
                class="p-1"
                @click="initMacAddressModal()"
              >
                <icon-edit
                  :title="$t('pageNetwork.modal.editMacAddressTitle')"
                />
              </b-button>
            </dt>
            <dd>
              {{ dataFormatter(macAddress) }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/16';
import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Ipv4Table',
  components: {
    IconEdit,
    PageSection,
  },
  mixins: [BVToastMixin, DataFormatterMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selectedInterface: '',
      linkStatus: '',
      linkSpeed: '',
      fqdn: '',
      macAddress: '',
    };
  },
  computed: {
    ...mapState('network', ['ethernetData']),
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getSettings();
    },
  },
  created() {
    this.getSettings();
    this.$store.dispatch('network/getEthernetData').finally(() => {
      // Emit initial data fetch complete to parent component
      this.$root.$emit('network-interface-settings-complete');
    });
  },
  methods: {
    getSettings() {
      this.selectedInterface = this.tabIndex;
      this.linkStatus = this.ethernetData[this.selectedInterface].LinkStatus;
      this.linkSpeed = this.ethernetData[this.selectedInterface].SpeedMbps;
      this.fqdn = this.ethernetData[this.selectedInterface].FQDN;
      this.macAddress = this.ethernetData[this.selectedInterface].MACAddress;
    },
    initMacAddressModal() {
      this.$bvModal.show('modal-mac-address');
    },
  },
};
</script>
