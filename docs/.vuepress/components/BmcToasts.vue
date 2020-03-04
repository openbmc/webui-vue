<template>
    <div>
        <b-button variant="success" @click="makeToast('success')">Show Success</b-button>
        <b-button variant="danger" @click="makeToast('danger')">Show Error</b-button>
        <b-button variant="info" @click="makeToast('info')">Show Info</b-button>
        <b-button variant="warning" @click="makeToast('warning')">Show Warning</b-button>
    </div>
</template>

<script>
import "../../../src/assets/styles/_obmc-custom.scss";
// import Vue from 'vue';
// import {ToastPlugin} from "bootstrap-vue";
import { BButton, BToast, BToaster } from "bootstrap-vue";
// Vue.use(ToastPlugin);
export default {
    name: 'BmcToasts',
    components: {
        BButton,
        BToaster,
        BToaster
    },
    methods: {
        makeToast(variant = null) {
            let title = variant == 'danger' ? 'error' : variant;
            this.$bvToast.toast(`This is a ${title} toast message`, {
                title: `${title.charAt(0).toUpperCase()}${title.slice(1)}`,
                variant: variant
            });
        }
    }
}
</script>
<style scoped>
    button {
        margin-right: .5rem;
        margin-bottom: 1rem;
    }
</style>