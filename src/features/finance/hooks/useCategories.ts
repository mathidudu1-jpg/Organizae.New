import { useQuery } from '@tanstack/react-query';

import { listCategories } from '../api/categories';
import { financeKeys } from '../keys';

export function useCategories() {
  return useQuery({
    queryKey: financeKeys.categories(),
    queryFn: listCategories,
  });
}
