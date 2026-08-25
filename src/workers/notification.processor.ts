import { TaskAssignedJob } from '../queues/notification.types';

export const sendTaskAssignmentEmail = async (
  data: TaskAssignedJob,
  jobId?: string
) => {
  const { userEmail, userName, taskTitle } = data;

  console.log(`[EMAIL] Sending task assignment email`);

  console.log(`[EMAIL] Job ID: ${jobId ?? 'unknown'}`);

  console.log(`[EMAIL] To: ${userEmail}`);

  console.log(`[EMAIL] User: ${userName}`);

  console.log(`[EMAIL] Task: ${taskTitle}`);

  // Mock email delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(`[EMAIL] Email sent successfully`);
};

// export async function sendTaskAssignmentEmail(job: Job<TaskAssignedJob>) {
//   console.log(`[EMAIL] Sending email to ${job.data.userEmail}`);

//   // Testing failure
//   if (process.env.MOCK_EMAIL_FAILURE === 'true') {
//     throw new Error('Mock email provider failure');
//   }

//   await new Promise((resolve) => setTimeout(resolve, 500));

//   console.log(`[EMAIL] Email sent successfully`);
// }
