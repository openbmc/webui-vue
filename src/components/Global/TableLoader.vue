<template>
  <div class="text-center text-danger my-2 table-loader">
    <b-spinner
      class="align-middle spinner-border text-danger"
      role="status"
    ></b-spinner>
    <strong> Loading...</strong>
  </div>
</template>
<script>
export default {
  name: 'TableLoader',
};
</script>
