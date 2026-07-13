import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTask, deleteTask, listTasks, updateTask, type TaskInsert } from '../api/tasks';
import { personalKeys } from '../keys';

export function useTasks() {
  return useQuery({
    queryKey: personalKeys.tasks(),
    queryFn: listTasks,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInsert) => createTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.tasks() }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      updateTask(id, {
        is_completed: done,
        completed_at: done ? new Date().toISOString() : null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.tasks() }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.tasks() }),
  });
}
