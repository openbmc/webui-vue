<template>
    <page-section section-title="Section Title">
    <dl>
        <dt>Firmware version</dt>
        <dd>xx.xxx.xxx</dd>
    </dl>
    </page-section>
</template>
<script>
import PageSection from '@/components/Global/PageSection';

export default {
    name: 'BMCPageSection',
    components: {
        PageSection
    }
}
</script>
<style>
    .page-section h2 {
        border-bottom: 0;
    }
</style>