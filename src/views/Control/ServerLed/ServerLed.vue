<template>
  <div class="container-fluid px-0">
    <page-title class="mb-5" />
    <h4 class="border-bottom pb-2 mb-4">
      {{ $t('pageServerLed.serverLedTitle') }}
    </h4>
    <b-row>
      <b-col md="12">
        <page-section>
          <h6 class="font-weight-bold">
            {{ $t('pageServerLed.serverLedSubTitle') }}
          </h6>
          <p class="mb-3">{{ $t('pageServerLed.serverLedInformation') }}</p>
          <b-form-checkbox v-model="serverLedLight" name="check-button" switch>
            <span v-if="serverLedLight">{{ $t('global.status.on') }}</span>
            <span v-else>{{ $t('global.status.off') }}</span>
          </b-form-checkbox>
        </page-section>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';

export default {
  name: 'ServerLed',
  components: { PageTitle, PageSection },
  data() {
    return {
      serverLedLight: false
    };
  }
};
</script>

<style lang="scss" scoped>
.page-title {
  h1 {
    font-weight: 900 !important;
  }
}
</style>
