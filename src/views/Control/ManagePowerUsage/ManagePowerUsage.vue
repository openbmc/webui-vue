<template>
  <b-container fluid>
    <page-title />
    <b-row>
      <b-col md="12" lg="12" xl="12">
        <page-section
          :section-title="$t('pageManagePowerUsage.powerInformation')"
        >
          <b-row>
            <b-col>
              <dl>
                <dt>{{ $t('pageManagePowerUsage.powerConsumption') }}</dt>
                <dd>{{ $t('global.status.notAvailable') }}</dd>
              </dl>
            </b-col>
          </b-row>
        </page-section>
      </b-col>
      <b-col md="12" lg="12" xl="12">
        <page-section
          :section-title="$t('pageManagePowerUsage.serverPowCapSetting')"
        >
          <div>
            Set a power cap to keep power consumption at or below the specified
            value in watts
          </div>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';
import BVToastMixin from '../../../components/Mixins/BVToastMixin';

export default {
  name: 'ManagePowerUsage',
  components: { PageTitle, PageSection },
  mixins: [BVToastMixin],
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
