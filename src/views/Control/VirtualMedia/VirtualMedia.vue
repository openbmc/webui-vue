<template>
    <b-container fluid="xl">
        <page-title />
        <b-row class="mb-4">
            <b-col md="12">
                <page-section :section-title="$t('pageVirtualMedia.virtualMediaSubTitleFirst')">
                    <b-row>
                        <b-col md="6"
                            v-for="(dev, $index) in proxyDevices"
                            :key="$index"
                        >
                            <b-form-group :label="dev.name" :label-for="dev.name" label-class="bold">
                                <b-form-file
                                    :id="dev.name"
                                    accept=".pem"
                                    plain
                                />
                            </b-form-group>
                            <b-button variant="primary" @click="startVM">
                                {{ 'Start' }}
                            </b-button>
                        </b-col>
                    </b-row>
                </page-section>
            </b-col>
        </b-row>
        <b-row class="mb-4">
            <b-col md="12">
                <page-section :section-title="$t('pageVirtualMedia.virtualMediaSubTitleSecond')">
                    <b-row>
                        <b-col md="6"
                            v-for="(dev, $index) in legacyDevices"
                            :key="$index"
                        >
                            <b-form-group :label="dev.name" :label-for="dev.name" label-class="bold">
                                <b-form-file
                                    :id="dev.name"
                                    accept=".pem"
                                    plain
                                />
                            </b-form-group>
                            <b-button variant="primary" @click="startLegacy">
                                {{ 'Start' }}
                            </b-button>
                        </b-col>
                    </b-row>
                </page-section>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import PageTitle from '../../../components/Global/PageTitle';
import PageSection from '../../../components/Global/PageSection';
import BVToastMixin from '../../../components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';

export default {
    name: 'VirtualMedia',
    components: { PageTitle, PageSection },
    mixins: [BVToastMixin, LoadingBarMixin],
    computed: {
    },
    data() {
        return {
            proxyDevices: [{ 'name': 'USB0' }, { 'name': 'ISO0' }],
            legacyDevices: [{ 'name': 'USB1' }, { 'name': 'USB2' }]
        }
    },
    methods: {
        startVM() {
        },
        startLegacy() {
        }
    }
};
</script>

<style lang="scss" scoped>
@import 'src/assets/styles/helpers';
   .bold {
      font-weight: 600;
    }
</style>