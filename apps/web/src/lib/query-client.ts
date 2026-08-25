import { QueryCache, QueryClient, } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err) => {
      const message =
        (err as Error)?.message ??
        'Something went wrong';
      console.error(message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});
