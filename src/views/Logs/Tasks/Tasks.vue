<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="12">
        <page-section :section-title="$t('pageTasks.backgroundTasks')">
          <b-table
            id="table-task-entries"
            ref="table"
            show-empty
            hover
            sort-icon-left
            no-sort-reset
            :sort-by="['startTime']"
            :sort-desc="[true]"
            responsive="md"
            thead-class="table-light"
            :fields="fields"
            :items="tasks"
            :empty-text="emptyText"
            :busy="isLoading"
            :per-page="perPage"
            :current-page="currentPage"
          >
            <!-- State column: Redfish TaskState with an icon derived from
                 TaskStatus so Warning and Critical are not shown as success -->
            <template #cell(state)="{ item }">
              <status-icon :status="getStatusIcon(item)" />
              {{ item.state }}
            </template>

            <!-- Task Description column -->
            <template #cell(name)="{ value }">
              {{ value }}
            </template>

            <!-- Message column -->
            <template #cell(message)="{ item }">
              <template v-if="item.message">
                <p class="mb-0">{{ item.message }}</p>
                <p v-if="item.resolution" class="mb-0 text-muted">
                  {{ item.resolution }}
                </p>
              </template>
              <template v-else>--</template>
            </template>

            <!-- Percent Complete column -->
            <template #cell(percentComplete)="{ value }">
              <template v-if="value !== null">{{ value }}</template>
              <template v-else>--</template>
            </template>

            <!-- Http Operation column -->
            <template #cell(httpOperation)="{ value }">
              {{ value || '--' }}
            </template>

            <!-- Target Uri column -->
            <template #cell(targetUri)="{ value }">
              {{ value || '--' }}
            </template>

            <!-- Start Time column -->
            <template #cell(startTime)="{ value }">
              <template v-if="value">
                <p class="mb-0">{{ $filters.formatDate(value) }}</p>
                <p class="mb-0">{{ $filters.formatTime(value) }}</p>
              </template>
              <template v-else>--</template>
            </template>

            <!-- End Time column -->
            <template #cell(endTime)="{ value }">
              <template v-if="value">
                <p class="mb-0">{{ $filters.formatDate(value) }}</p>
                <p class="mb-0">{{ $filters.formatTime(value) }}</p>
              </template>
              <template v-else>--</template>
            </template>
          </b-table>
        </page-section>
      </b-col>
    </b-row>
    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="totalRows"
          aria-controls="table-task-entries"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import StatusIcon from '@/components/Global/StatusIcon';
import { useTasks } from '@/components/Composables/useTasks';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';

const { t } = useI18n();
const { startLoader, endLoader, hideLoader } = useLoadingBar();

const { tasks, isLoading, isError } = useTasks();

// Pagination
const currentPage = ref(1);
const perPage = ref(20);
const itemsPerPageOptions = [
  { value: 10, text: '10' },
  { value: 20, text: '20' },
  { value: 30, text: '30' },
  { value: 40, text: '40' },
  { value: 0, text: t('global.table.viewAll') },
];
const totalRows = computed(() =>
  perPage.value === 0 ? 0 : tasks.value.length,
);

watch(perPage, (newPerPage) => {
  if (newPerPage === 0) currentPage.value = 1;
});

const fields = [
  { key: 'state', sortable: true, label: t('pageTasks.table.state') },
  { key: 'name', sortable: true, label: t('pageTasks.table.name') },
  { key: 'message', sortable: true, label: t('pageTasks.table.message') },
  {
    key: 'percentComplete',
    sortable: true,
    label: t('pageTasks.table.percentComplete'),
  },
  {
    key: 'httpOperation',
    sortable: true,
    label: t('pageTasks.table.httpOperation'),
  },
  { key: 'targetUri', sortable: false, label: t('pageTasks.table.targetUri') },
  { key: 'startTime', sortable: true, label: t('pageTasks.table.startTime') },
  { key: 'endTime', sortable: true, label: t('pageTasks.table.endTime') },
];

// A failed collection request would otherwise be indistinguishable from a BMC
// that simply has no tasks.
const emptyText = computed(() =>
  isError.value
    ? t('pageTasks.table.errorLoadingTasks')
    : t('global.table.emptyMessage'),
);

// Named so it does not shadow the StatusIcon component in the template.
function getStatusIcon(task) {
  if (task.isActive) return 'info';
  if (task.succeeded) return 'success';
  // bmcweb reports Exception with a TaskStatus of Warning, not Critical.
  if (task.state === 'Exception' || task.status === 'Critical') return 'danger';
  return 'warning';
}

watch(isLoading, (loading) => (loading ? startLoader() : endLoader()), {
  immediate: true,
});

onBeforeUnmount(() => {
  hideLoader();
});
</script>
