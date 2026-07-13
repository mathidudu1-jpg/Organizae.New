export const personalKeys = {
  all: ['personal'] as const,
  tasks: () => ['personal', 'tasks'] as const,
  events: () => ['personal', 'events'] as const,
};
