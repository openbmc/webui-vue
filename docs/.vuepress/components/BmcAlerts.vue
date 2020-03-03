<template>
    <div>
        <b-alert show variant="success">This is a success alert message.</b-alert>
        <b-alert show variant="warning">This is a warning alert message.</b-alert>
        <b-alert show variant="danger">
           <strong class="alert-title">Invalid username or password</strong>
           <span>Verify your username and password and try again.</span>
        </b-alert>
        <b-alert show variant="info">This is an info alert message.</b-alert>
    </div>
</template>

<script>
import "../../../src/assets/styles/_obmc-custom.scss";
import { BAlert } from "bootstrap-vue";

export default {
    name: 'BmcAlerts',
    components: { BAlert }
}
</script>