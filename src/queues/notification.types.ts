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
