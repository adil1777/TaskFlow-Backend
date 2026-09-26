export interface JobParams {
  id: string;
}

export enum JobStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;

  metadata: {
    name: string;
    attemptsMade: number;
    maxAttempts: number;
    createdAt: number;
    processedOn: number | null;
    finishedOn: number | null;
    failedReason: string | null;
  };
}
