<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col xl="12">
        <page-section :section-title="$t('pageTasks.backgroundTasks')">
          <b-table
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
            :empty-text="$t('global.table.emptyMessage')"
            :busy="isBusy"
            :per-page="perPage"
            :current-page="currentPage"
          >
            <!-- Task Description column -->
            <template #cell(name)="{ value }">
              {{ value }}
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

            <!-- Action column: cancel running task (only when TaskMonitor is
                 available) / show completion status for finished tasks -->
            <template #cell(action)="{ item }">
              <div class="d-flex align-items-center justify-content-center">
                <b-button
                  v-if="item.isActive && item.taskMonitor"
                  size="sm"
                  variant="danger"
                  @click="onCancelTask(item)"
                >
                  {{ $t('global.action.cancel') }}
                </b-button>
                <status-icon
                  v-else-if="item.state === 'Completed'"
                  status="success"
                  :title="item.state"
                />
                <status-icon
                  v-else-if="!item.isActive"
                  status="danger"
                  :title="item.state"
                />
              </div>
            </template>
          </b-table>
        </page-section>
      </b-col>
    </b-row>
    <!-- Table pagination -->
    <b-row>
      <b-col sm="6" xl="5">
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
      <b-col sm="6" xl="5">
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
import { useTasks, getRedfishErrorMessage } from '@/components/Composables/useTasks';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useToast } from '@/components/Composables/useToast';
import eventBus from '@/eventBus';
import api from '@/store/api';

const { t } = useI18n();
const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { successToast, errorToast } = useToast();

const { tasks, isLoading, isFetching, refetch } = useTasks();

// Local loading state for the cancel action
const isCancelling = ref(false);

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
  { key: 'name', sortable: true, label: t('pageTasks.table.taskDescription') },
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
  {
    key: 'action',
    sortable: false,
    label: t('pageTasks.table.action'),
    tdClass: 'text-center',
    thClass: 'text-center',
  },
];

const isBusy = computed(
  () => isLoading.value || isFetching.value || isCancelling.value,
);

async function confirmCancel() {
  return new Promise((resolve) => {
    eventBus.$emit('confirm:open', {
      title: t('pageTasks.modal.cancelTask'),
      message: t('pageTasks.modal.cancelTaskConfirmation'),
      okTitle: t('pageTasks.modal.cancelTask'),
      okVariant: 'danger',
      resolve,
    });
  });
}

async function onCancelTask(task) {
  const confirmed = await confirmCancel();
  if (!confirmed) return;
  isCancelling.value = true;
  try {
    // Cancel by DELETE to the TaskMonitor URI — the Redfish-defined
    // cancellation mechanism. Bypass TanStack Query mutations here to
    // ensure the toast fires reliably regardless of the cache interceptor.
    await api.delete(task.taskMonitor);
    refetch();
    successToast(t('pageTasks.toast.successCancelTask'));
  } catch (error) {
    errorToast(
      getRedfishErrorMessage(error) || t('pageTasks.toast.errorCancelTask'),
    );
  } finally {
    isCancelling.value = false;
  }
}

watch(
  isBusy,
  (busy) => (busy ? startLoader() : endLoader()),
  { immediate: true },
);

onBeforeUnmount(() => {
  hideLoader();
});
</script>
