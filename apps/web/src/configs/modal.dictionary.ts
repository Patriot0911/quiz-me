import { LoadingState } from '@/lib/loading-mappers';

export const ConfirmModalButtonDictionary: Record<LoadingState, string> = {
  [LoadingState.Ide]: 'Confirm',
  [LoadingState.Pendding]: 'Processing...',
  [LoadingState.Loading]: 'Loading...',
  [LoadingState.Success]: 'Confirmed successfully!',
};
