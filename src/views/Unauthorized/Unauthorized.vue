<template>
  <div>
    <PageTitle :description="description" />
  </div>
</template>
<script>
import PageTitle from '../../components/Global/PageTitle';
export default {
  name: 'Unauthorized',
  components: {
    PageTitle
  },
  data() {
    return {
      description:
        'The attempted action is not accessible from the logged in account. Contact your system administrator to check your privilege role.'
    };
  }
};
</script>
