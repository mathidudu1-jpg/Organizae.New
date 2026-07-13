import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { todayISO } from '@/lib/format';

import { createEvent, deleteEvent, listUpcomingEvents, type EventInsert } from '../api/events';
import { personalKeys } from '../keys';

export function useUpcomingEvents() {
  return useQuery({
    queryKey: personalKeys.events(),
    queryFn: () => listUpcomingEvents(todayISO()),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EventInsert) => createEvent(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.events() }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.events() }),
  });
}
