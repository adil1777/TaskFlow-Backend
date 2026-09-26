import { TaskAssignedJob } from '../queues/notification.types';

export const sendTaskAssignmentEmail = async (
  data: TaskAssignedJob,
  jobId?: string
) => {
  const { userEmail, userName, taskTitle } = data;

  console.log('[EMAIL] Sending task assignment email', {
    jobId: jobId ?? null,
    userId: data.userId,
    userEmail,
    userName,
    taskId: data.taskId,
    taskTitle,
  });

  // Mock email provider delay.
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('[EMAIL] Task assignment email sent', {
    jobId: jobId ?? null,
    userEmail,
  });
};

/* Later I can replace this with:

notification.processor.ts
        ↓
email.service.ts
        ↓
Resend / SendGrid / SES
*/
