// How to run this test in isolation:
//   npm run test:unit -- useTasks.spec.js

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/store/api', () => ({ default: { get: vi.fn() } }));

import { transformTask } from '@/components/Composables/useTasks';

describe('transformTask', () => {
  it('maps a Redfish task onto the display shape', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/3',
      Id: '3',
      Name: 'Task 3',
      TaskState: 'Running',
      TaskStatus: 'OK',
      PercentComplete: 42,
      StartTime: '2026-01-01T00:00:00+00:00',
      EndTime: '2026-01-01T00:05:00+00:00',
      Messages: [{ Message: 'Task started.' }],
      Payload: {
        HttpOperation: 'POST',
        TargetUri: '/redfish/v1/UpdateService/update',
      },
    });

    expect(task).toEqual({
      id: '3',
      name: 'Task 3',
      state: 'Running',
      status: 'OK',
      percentComplete: 42,
      httpOperation: 'POST',
      targetUri: '/redfish/v1/UpdateService/update',
      startTime: new Date('2026-01-01T00:00:00+00:00'),
      endTime: new Date('2026-01-01T00:05:00+00:00'),
      message: 'Task started.',
      resolution: null,
      uri: '/redfish/v1/TaskService/Tasks/3',
      isActive: true,
      succeeded: false,
    });
  });

  it('uses the last message, since bmcweb appends TaskStarted first', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/2',
      Id: '2',
      Name: 'Task 2',
      TaskState: 'Exception',
      Messages: [
        { Message: "The task with Id '2' has started." },
        { Message: "The task with Id '2' has completed with errors." },
      ],
    });

    expect(task.message).toBe("The task with Id '2' has completed with errors.");
  });

  it('drops the placeholder resolution used by the TaskEvent registry', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/2',
      Id: '2',
      Name: 'Task 2',
      Messages: [{ Message: 'Failed.', Resolution: 'None.' }],
    });

    expect(task.resolution).toBeNull();
  });

  it('keeps a resolution that tells the user what to do', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/2',
      Id: '2',
      Name: 'Task 2',
      Messages: [{ Message: 'Failed.', Resolution: 'Retry the update.' }],
    });

    expect(task.resolution).toBe('Retry the update.');
  });

  it('falls back to placeholders when optional properties are absent', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/1',
      Id: '1',
      Name: 'Task 1',
    });

    expect(task.state).toBe('Unknown');
    expect(task.status).toBe('Unknown');
    expect(task.percentComplete).toBeNull();
    expect(task.httpOperation).toBeNull();
    expect(task.targetUri).toBeNull();
    expect(task.startTime).toBeNull();
    expect(task.endTime).toBeNull();
    expect(task.message).toBeNull();
    expect(task.resolution).toBeNull();
  });

  it('returns null for an unparseable date', () => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/1',
      Id: '1',
      Name: 'Task 1',
      StartTime: 'not-a-date',
    });

    expect(task.startTime).toBeNull();
  });

  it.each(['Completed', 'Exception', 'Cancelled', 'Killed'])(
    'marks %s as inactive',
    (TaskState) => {
      const task = transformTask({
        '@odata.id': '/redfish/v1/TaskService/Tasks/1',
        Id: '1',
        Name: 'Task 1',
        TaskState,
      });

      expect(task.isActive).toBe(false);
    },
  );

  it.each([
    'New',
    'Starting',
    'Running',
    'Suspended',
    'Pending',
    'Stopping',
    'Cancelling',
    'Interrupted',
  ])('keeps %s active so the list continues to poll', (TaskState) => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/1',
      Id: '1',
      Name: 'Task 1',
      TaskState,
    });

    expect(task.isActive).toBe(true);
  });

  it.each([
    [100],
    // bmcweb never advances PercentComplete for dump or update tasks.
    [0],
    [undefined],
  ])('counts a Completed/OK task with percent %s as succeeded', (percent) => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/1',
      Id: '1',
      Name: 'Task 1',
      TaskState: 'Completed',
      TaskStatus: 'OK',
      PercentComplete: percent,
    });

    expect(task.succeeded).toBe(true);
  });

  it.each([
    [{ TaskState: 'Completed', TaskStatus: 'OK', PercentComplete: 40 }],
    [{ TaskState: 'Completed', TaskStatus: 'Warning', PercentComplete: 100 }],
    [{ TaskState: 'Exception', TaskStatus: 'Warning', PercentComplete: 100 }],
    [{ TaskState: 'Cancelled', TaskStatus: 'OK' }],
  ])('does not count %o as succeeded', (fields) => {
    const task = transformTask({
      '@odata.id': '/redfish/v1/TaskService/Tasks/1',
      Id: '1',
      Name: 'Task 1',
      ...fields,
    });

    expect(task.succeeded).toBe(false);
  });
});
