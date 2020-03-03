<template>
    <div>
        <alert show="true" variant="warning">This is a warning message</alert>
        <alert show="true" variant="danger">This is an error message</alert>
        <alert show="true" variant="info">This is an info message</alert>
        <alert show="true" title="Error" variant="danger">This is an error message with a titile. An edge case used on the login page.</alert>
    </div>
</template>

<script>

export default {
    name: 'BmcAlerts',
}
</script>