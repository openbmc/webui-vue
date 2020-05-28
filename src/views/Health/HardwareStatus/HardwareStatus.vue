<template>
  <b-container fluid="xl">
    <page-title />

    <!-- System table -->
    <table-system />
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import TableSystem from './HardwareStatusTableStystem';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
  components: { PageTitle, TableSystem },
  mixins: [LoadingBarMixin],
  created() {
    this.startLoader();
    const systemTablePromise = new Promise(resolve => {
      this.$root.$on('hardwareStatus::system::complete', () => resolve());
    });
    // Combine all child component Promises to indicate
    // when page data load complete
    Promise.all([systemTablePromise]).finally(() => this.endLoader());
  },
  beforeRouteLeave(to, from, next) {
    // Hide loader if user navigates away from page
    // before requests complete
    this.hideLoader();
    next();
  }
};
</script>
