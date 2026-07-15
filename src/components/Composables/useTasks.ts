import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import api from '@/store/api';

export const taskServiceQueryKey = ['redfish', 'taskService'] as const;
export const tasksQueryKey = ['redfish', 'tasks'] as const;

const TASK_SERVICE_PATH = '/redfish/v1/TaskService';
const TASKS_PATH = '/redfish/v1/TaskService/Tasks';

/**
 * Redfish TaskService resource
 */
export interface TaskService {
  '@odata.id': string;
  Id: string;
  Name: string;
  ServiceEnabled?: boolean;
  CompletedTaskOverWritePolicy?: string;
  LifeCycleEventOnTaskStateChange?: boolean;
  DateTime?: string;
}

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
 * Task states that indicate a task is no longer active and may be deleted
 */
const COMPLETED_TASK_STATES = [
  'Completed',
  'Exception',
  'Cancelled',
  'Interrupted',
  'Killed',
];

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
  messages: TaskMessage[];
  taskMonitor: string | null;
  uri: string;
  isActive: boolean;
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
  return {
    id: task.Id,
    name: task.Name,
    state,
    status: task.TaskStatus ?? 'Unknown',
    percentComplete:
      typeof task.PercentComplete === 'number' ? task.PercentComplete : null,
    httpOperation: task.Payload?.HttpOperation ?? null,
    targetUri: task.Payload?.TargetUri ?? null,
    startTime: parseTaskDate(task.StartTime),
    endTime: parseTaskDate(task.EndTime),
    messages: Array.isArray(task.Messages) ? task.Messages : [],
    taskMonitor: task.TaskMonitor ?? null,
    uri: task['@odata.id'],
    isActive: !COMPLETED_TASK_STATES.includes(state),
  };
}

/**
 * Redfish collection response for the Tasks collection
 */
interface TaskCollection {
  Members?: Array<{ '@odata.id': string } & Partial<RawTask>>;
}

/**
 * Determines whether a failed request is worth retrying. Client errors (4xx)
 * and "Not Implemented" (501) are permanent for a given BMC, so we stop
 * retrying to avoid hammering the server.
 */
function shouldRetryTaskRequest(failureCount: number, error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  if (status !== undefined && (status === 501 || (status >= 400 && status < 500))) {
    return false;
  }
  return failureCount < 2;
}

/**
 * Fetches the full list of tasks.
 *
 * The Tasks collection is fetched without $expand because not all BMCs
 * implement the expand query (some return 501 Not Implemented). Each member
 * is then fetched individually.
 */
async function fetchTasks(signal?: AbortSignal): Promise<TaskDisplay[]> {
  const { data } = await api.get<TaskCollection>(TASKS_PATH, { signal });

  const members = data.Members ?? [];
  if (members.length === 0) return [];

  // Some BMCs already inline the task fields in the collection response.
  const alreadyExpanded = members.every(
    (member) => member.TaskState !== undefined || member.Name !== undefined,
  );

  if (alreadyExpanded) {
    return members.map((member) => transformTask(member as RawTask));
  }

  const results = await Promise.all(
    members.map((member) =>
      api
        .get<RawTask>(member['@odata.id'], { signal })
        .then((response) => transformTask(response.data))
        .catch((error) => {
          console.error(`Error fetching task ${member['@odata.id']}:`, error);
          return null;
        }),
    ),
  );

  return results.filter((task): task is TaskDisplay => task !== null);
}

export function useTaskService() {
  return useQuery({
    queryKey: taskServiceQueryKey,
    queryFn: async ({ signal }) => {
      const { data } = await api.get<TaskService>(TASK_SERVICE_PATH, {
        signal,
      });
      return data;
    },
    staleTime: 60000,
    retry: shouldRetryTaskRequest,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function getRedfishErrorMessage(error: unknown): string | null {
  const response = (
    error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: {
          error?: {
            message?: string;
            '@Message.ExtendedInfo'?: Array<{ Message?: string }>;
          };
        };
      };
    }
  )?.response;

  const redfishError = response?.data?.error;
  const extendedMessage =
    redfishError?.['@Message.ExtendedInfo']?.[0]?.Message;

  return extendedMessage ?? redfishError?.message ?? response?.statusText ?? null;
}


export interface DeleteTasksResult {
  successCount: number;
  errorCount: number;
  errorMessages: string[];
}


export interface UseTasksReturn {
  /** Transformed tasks ready for display */
  tasks: ComputedRef<TaskDisplay[]>;
  isLoading: ReturnType<typeof useQuery>['isLoading'];
  isFetching: ReturnType<typeof useQuery>['isFetching'];
  isError: ReturnType<typeof useQuery>['isError'];
  error: ReturnType<typeof useQuery>['error'];
  refetch: ReturnType<typeof useQuery>['refetch'];
  tasksQuery: ReturnType<typeof useQuery<TaskDisplay[], unknown>>;
  deleteTasks: ReturnType<
    typeof useMutation<DeleteTasksResult, unknown, string[]>
  >;
  deleteTaskEntries: (uris: string[]) => Promise<DeleteTasksResult>;
}

/**
 * Composable for the list of background tasks and task mutations.
 *
 * Tasks are managed entirely in-memory within bmcweb, so the list is polled
 * to surface live progress while tasks are running.
 *
 * Focuses on query/mutation logic only - table selection and confirmation
 * are left to the consuming component to keep a unidirectional data flow.
 */
export function useTasks(): UseTasksReturn {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: tasksQueryKey,
    queryFn: ({ signal }) => fetchTasks(signal),
    // Only poll while at least one task is still running. Once every task has
    // reached a terminal state, stop polling to avoid needless 304 requests.
    refetchInterval: (query) => {
      const data = query.state.data as TaskDisplay[] | undefined;
      const hasActiveTask = data?.some((task) => task.isActive) ?? false;
      return hasActiveTask ? 5000 : false;
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
    retry: shouldRetryTaskRequest,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const tasks = computed<TaskDisplay[]>(() => tasksQuery.data.value ?? []);

  const deleteTasks = useMutation<DeleteTasksResult, unknown, string[]>({
    mutationFn: async (uris: string[]) => {
      const results = await Promise.allSettled(
        uris.map((uri) => api.delete(uri)),
      );
      const successCount = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const errorMessages = Array.from(
        new Set(
          results
            .filter(
              (result): result is PromiseRejectedResult =>
                result.status === 'rejected',
            )
            .map(
              (result) => getRedfishErrorMessage(result.reason) ?? '',
            )
            .filter((message) => message !== ''),
        ),
      );
      return {
        successCount,
        errorCount: results.length - successCount,
        errorMessages,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
    },
  });

  async function deleteTaskEntries(
    uris: string[],
  ): Promise<DeleteTasksResult> {
    return deleteTasks.mutateAsync(uris);
  }

  return {
    tasks,
    isLoading: tasksQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    tasksQuery,
    deleteTasks,
    deleteTaskEntries,
  };
}
