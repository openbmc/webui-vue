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

            <!-- Action column: cancel running task / show completion status -->
            <template #cell(action)="{ item }">
              <div class="d-flex align-items-center justify-content-center">
                <b-button
                  v-if="item.isActive"
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
                  v-else
                  status="danger"
                  :title="item.state"
                />
              </div>
            </template>
          </b-table>
        </page-section>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import StatusIcon from '@/components/Global/StatusIcon';
import { useTasks, getRedfishErrorMessage } from '@/components/Composables/useTasks';
import { useLoadingBar } from '@/components/Composables/useLoadingBar';
import { useToast } from '@/components/Composables/useToast';
import eventBus from '@/eventBus';

const { t } = useI18n();
const { startLoader, endLoader, hideLoader } = useLoadingBar();
const { successToast, errorToast } = useToast();

const { tasks, isLoading, isFetching, deleteTasks, deleteTaskEntries } =
  useTasks();

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
  () => isLoading.value || isFetching.value || deleteTasks.isPending.value,
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
  try {
    const { successCount, errorCount, errorMessages } = await deleteTaskEntries(
      [task.uri],
    );
    if (successCount) {
      successToast(t('pageTasks.toast.successCancelTask'));
    }
    if (errorCount) {
      // Surface the backend's reason (e.g. task cannot be cancelled) when present.
      errorToast(errorMessages[0] || t('pageTasks.toast.errorCancelTask'));
    }
  } catch (error) {
    errorToast(
      getRedfishErrorMessage(error) || t('pageTasks.toast.errorCancelTask'),
    );
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
