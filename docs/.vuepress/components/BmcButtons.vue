<template>
    <div>
        <h3 class="h4">Enabled</h3>
        <b-button variant="primary">Primary</b-button>
        <b-button variant="secondary">Secondary</b-button>
        <b-button variant="success">Success</b-button>
        <b-button variant="info">Info</b-button>
        <b-button variant="warning">Warning</b-button>
        <b-button variant="danger">Danger</b-button>
        <b-button variant="light">Light</b-button>
        <b-button variant="dark">Dark</b-button>
        <b-button variant="link">Link Button</b-button>

        <h3 class="h4">Disabled</h3>
        <b-button disabled variant="primary">Primary</b-button>
        <b-button disabled variant="secondary">Secondary</b-button>
        <b-button disabled variant="success">Success</b-button>
        <b-button disabled variant="info">Info</b-button>
        <b-button disabled variant="warning">Warning</b-button>
        <b-button disabled variant="danger">Danger</b-button>
        <b-button disabled variant="light">Light</b-button>
        <b-button disabled variant="dark">Dark</b-button>
        <b-button disabled variant="link">Link Button</b-button>
    </div>
</template>

<script>
import "../../../src/assets/styles/_obmc-custom.scss";
 import { BButton } from "bootstrap-vue";
export default {
    name: 'BmcButtons',
    components: { BButton }
}
</script>
<style scoped>
    button {
        margin-bottom: 1rem;
        margin-right: .5rem;
    }

    h3 {
        margin: .5rem 0 1rem;
    }
</style>