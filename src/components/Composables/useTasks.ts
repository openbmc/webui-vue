import { useQuery } from '@tanstack/vue-query';
import { computed, type ComputedRef } from 'vue';
import { fetchCollection } from '@/api/composables/useRedfishCollection';
import {
  useRedfishRoot,
  supportsExpandQuery,
} from '@/api/composables/useRedfishRoot';

export const tasksQueryKey = ['redfish', 'tasks'] as const;

const TASKS_PATH = '/redfish/v1/TaskService/Tasks';

export interface TaskMessage {
  Message?: string;
  MessageId?: string;
  Severity?: string;
  Resolution?: string;
}

export interface TaskPayload {
  HttpOperation?: string;
  TargetUri?: string;
  HttpHeaders?: string[];
  JsonBody?: string;
}

/**
 * Raw Redfish Task resource (PascalCase, as returned by bmcweb)
 */
export interface RawTask {
  '@odata.id': string;
  Id: string;
  Name: string;
  TaskState?: string;
  TaskStatus?: string;
  PercentComplete?: number;
  StartTime?: string;
  EndTime?: string;
  Messages?: TaskMessage[];
  TaskMonitor?: string;
  Payload?: TaskPayload;
}

/**
 * Task states a task never leaves. Interrupted, Stopping and Cancelling are
 * deliberately absent: bmcweb keeps those tasks in its active set and they can
 * still move back to Running, so they have to keep polling.
 */
const TERMINAL_TASK_STATES = ['Completed', 'Exception', 'Cancelled', 'Killed'];

/**
 * Active states that bmcweb never drives forward on its own, so they can sit
 * unchanged for the life of the page and are polled at a slower cadence.
 */
const STALLED_TASK_STATES = ['Interrupted', 'Stopping', 'Cancelling'];

const ACTIVE_POLL_MS = 5000;
const STALLED_POLL_MS = 30000;

/**
 * Task data shaped for display in the UI table
 */
export interface TaskDisplay {
  id: string;
  name: string;
  state: string;
  status: string;
  percentComplete: number | null;
  httpOperation: string | null;
  targetUri: string | null;
  startTime: Date | null;
  endTime: Date | null;
  message: string | null;
  resolution: string | null;
  uri: string;
  isActive: boolean;
  /** Redfish only counts a task as successful when all three fields agree. */
  succeeded: boolean;
}

/**
 * Parses a Redfish date-time string into a Date, returning null when absent
 * or unparseable so the UI can render a placeholder.
 */
function parseTaskDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Transforms a raw Redfish Task into the display shape used by the table.
 */
export function transformTask(task: RawTask): TaskDisplay {
  const state = task.TaskState ?? 'Unknown';
  const status = task.TaskStatus ?? 'Unknown';
  const messages = Array.isArray(task.Messages) ? task.Messages : [];
  // bmcweb appends TaskStarted first, so the last entry describes the outcome.
  const latest = messages[messages.length - 1];
  const resolution = latest?.Resolution;
  const percentComplete =
    typeof task.PercentComplete === 'number' ? task.PercentComplete : null;
  // bmcweb leaves PercentComplete at 0 for most task types, so it can only
  // contradict a Completed/OK task that reported real progress.
  const reportedIncomplete =
    percentComplete !== null && percentComplete > 0 && percentComplete < 100;
  return {
    id: task.Id,
    name: task.Name,
    state,
    status,
    percentComplete,
    httpOperation: task.Payload?.HttpOperation ?? null,
    targetUri: task.Payload?.TargetUri ?? null,
    startTime: parseTaskDate(task.StartTime),
    endTime: parseTaskDate(task.EndTime),
    message: latest?.Message ?? null,
    // Every entry in the DMTF TaskEvent registry sets Resolution to "None.".
    resolution: resolution && resolution !== 'None.' ? resolution : null,
    uri: task['@odata.id'],
    isActive: !TERMINAL_TASK_STATES.includes(state),
    succeeded: state === 'Completed' && status === 'OK' && !reportedIncomplete,
  };
}

/**
 * Determines whether a failed request is worth retrying. Client errors (4xx)
 * and "Not Implemented" (501) are permanent for a given BMC, so we stop
 * retrying to avoid hammering the server.
 */
function shouldRetryTaskRequest(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (
    status !== undefined &&
    (status === 501 || (status >= 400 && status < 500))
  ) {
    return false;
  }
  return failureCount < 2;
}

export interface UseTasksReturn {
  /** Transformed tasks ready for display */
  tasks: ComputedRef<TaskDisplay[]>;
  isLoading: ReturnType<typeof useQuery>['isLoading'];
  isError: ReturnType<typeof useQuery>['isError'];
  error: ReturnType<typeof useQuery>['error'];
}

/**
 * Composable for the list of background tasks.
 *
 * Tasks are managed entirely in-memory within bmcweb, so the list is polled
 * to surface live progress while tasks are running.
 */
export function useTasks(): UseTasksReturn {
  const { data: serviceRoot } = useRedfishRoot();
  const canExpand = computed(() => supportsExpandQuery(serviceRoot.value));

  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: async () => {
      const members = await fetchCollection<RawTask>(
        TASKS_PATH,
        { expand: true },
        canExpand.value,
      );
      return members.map(transformTask);
    },
    // Wait for ServiceRoot so the first fetch can already use $expand where the
    // BMC advertises it, instead of falling back to one GET per task.
    enabled: computed(() => !!serviceRoot.value),
    // Stop polling once every task is terminal, and back off for tasks parked
    // in a state the service will not move on its own.
    refetchInterval: (query) => {
      const data = query.state.data as TaskDisplay[] | undefined;
      const active = data?.filter((task) => task.isActive) ?? [];
      if (active.length === 0) return false;
      return active.some((task) => !STALLED_TASK_STATES.includes(task.state))
        ? ACTIVE_POLL_MS
        : STALLED_POLL_MS;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    retry: shouldRetryTaskRequest,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const tasks = computed<TaskDisplay[]>(() => tasksQuery.data.value ?? []);

  return {
    tasks,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
  };
}
