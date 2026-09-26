export const NotificationJobName = {
  TASK_ASSIGNED: 'task-assigned',
} as const;

export const DeadLetterJobName = {
  FAILED_NOTIFICATION: 'failed-notification',
} as const;

export interface TaskAssignedJob {
  assignmentId: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userEmail: string;
  userName: string;
  assignedBy: string;
}

export interface FailedNotificationJob {
  originalJobId: string;
  originalJobName: string;
  failedReason: string;
  attemptsMade: number;
  maxAttempts: number;
  data: TaskAssignedJob;
}
