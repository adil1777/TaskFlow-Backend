import { TaskFilterInput } from "../modules/task/task.types";
import { taskFilterSchema } from "../modules/task/task.validation";

export const parseTaskFilters = (
  query: Record<string, unknown>
): TaskFilterInput => {
  return taskFilterSchema.parse(query);
};