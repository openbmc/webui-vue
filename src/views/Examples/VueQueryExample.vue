<template>
  <b-container fluid="xl">
    <h2>Vue Query + Redfish API Example</h2>
    <p class="text-muted">
      Demonstrates type-safe API calls with automatic caching and loading states.
    </p>

    <!-- Account Service Info -->
    <b-card class="mb-4">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Account Service</h5>
          <b-button
            size="sm"
            variant="outline-primary"
            :disabled="isRefetching"
            @click="refetch"
          >
            {{ isRefetching ? 'Refreshing...' : 'Refresh' }}
          </b-button>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-4">
        <b-spinner />
        <p class="mt-2 mb-0">Loading account service...</p>
      </div>

      <!-- Error State -->
      <b-alert v-else-if="error" variant="danger" show>
        Error: {{ (error as any)?.message ?? error }}
      </b-alert>

      <!-- Data Display -->
      <div v-else-if="data">
        <dl class="row mb-0">
          <dt class="col-sm-4">Service Enabled</dt>
          <dd class="col-sm-8">
            <b-badge :variant="data.ServiceEnabled ? 'success' : 'danger'">
              {{ data.ServiceEnabled ? 'Yes' : 'No' }}
            </b-badge>
          </dd>

          <dt class="col-sm-4">Max Password Length</dt>
          <dd class="col-sm-8">{{ data.MaxPasswordLength ?? 'N/A' }}</dd>

          <dt class="col-sm-4">Min Password Length</dt>
          <dd class="col-sm-8">{{ data.MinPasswordLength ?? 'N/A' }}</dd>

          <dt class="col-sm-4">Account Lockout Threshold</dt>
          <dd class="col-sm-8">
            <div class="d-flex align-items-center gap-2">
              <b-form-input
                v-model.number="lockoutThreshold"
                type="number"
                :min="0"
                :max="65535"
                size="sm"
                style="width: 120px"
                :disabled="isSaving"
              />
              <b-button
                size="sm"
                variant="primary"
                :disabled="isSaving || lockoutThreshold === data.AccountLockoutThreshold"
                @click="saveLockoutThreshold"
              >
                {{ isSaving ? 'Saving...' : 'Save' }}
              </b-button>
              <small class="text-muted">(0–65535)</small>
            </div>
          </dd>

          <dt class="col-sm-4">Account Lockout Duration</dt>
          <dd class="col-sm-8">{{ data.AccountLockoutDuration ?? 'N/A' }} seconds</dd>

          <dt class="col-sm-4">Password Policy</dt>
          <dd class="col-sm-8">
            <code>{{ getPasswordPolicy() }}</code>
            <small class="text-muted ms-2">← Uses typed helper function</small>
          </dd>
        </dl>
      </div>
    </b-card>

    <!-- Code Example -->
    <b-card header="The Code">
      <pre class="mb-0 bg-dark text-light p-3 rounded">
<code class="language-typescript">import { useGetAccountService, usePatchAccountService } from '@/api/endpoints/redfish.gen';
import type { AccountService } from '@/api/model/AccountService';

// One line for a fully typed, cached GET!
const { data, isLoading, error, refetch } = useGetAccountService();

// One line for a fully typed PATCH mutation!
const updateAccountService = usePatchAccountService();

// Check state reactively
const isSaving = updateAccountService.isPending;

// Execute the mutation
await updateAccountService.mutateAsync({
  data: { AccountLockoutThreshold: 5 } as AccountService,
});</code>
      </pre>
    </b-card>
  </b-container>
</template>

<script setup lang="ts">
/**
 * Minimal Vue Query + Orval Example
 *
 * This demonstrates how easy it is to use the generated Redfish API:
 * - Type-safe data fetching with one line
 * - Automatic loading and error states
 * - Built-in caching and refetch
 * - Mutations with automatic cache invalidation
 */
import { ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import {
  useGetAccountService,
  usePatchAccountService,
  getGetAccountServiceQueryKey,
} from '@/api/endpoints/redfish.gen';
import type { AccountService } from '@/api/model/AccountService';

// One line for a fully typed, cached API call!
// data is Ref<AccountService | undefined>
const { data, isLoading, isRefetching, error, refetch } = useGetAccountService();

// Mutation for PATCH requests - also one line!
const updateAccountService = usePatchAccountService();
const isSaving = updateAccountService.isPending;

// Local state for the editable field
const lockoutThreshold = ref<number>(0);

// Sync local state when data loads
watch(
  () => data.value?.AccountLockoutThreshold,
  (newVal) => {
    if (newVal !== undefined && newVal !== null) {
      lockoutThreshold.value = newVal;
    }
  },
  { immediate: true },
);

// Save handler with cache invalidation
const queryClient = useQueryClient();
const saveLockoutThreshold = async () => {
  await updateAccountService.mutateAsync({
    data: { AccountLockoutThreshold: lockoutThreshold.value } as AccountService,
  });
  // Invalidate cache to refetch fresh data
  queryClient.invalidateQueries({ queryKey: getGetAccountServiceQueryKey() });
};

// Example: Access typed properties with full IDE autocomplete
const getPasswordPolicy = (): string => {
  if (!data.value) return 'Loading...';
  const svc: AccountService = data.value;
  return `${svc.MinPasswordLength}-${svc.MaxPasswordLength} characters`;
};
</script>
