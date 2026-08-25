'use client';

import { ILogOutModalProps } from '@/interfaces/auth/modal';
import useLogoutMutation from '@/hooks/mutations/auth/useLogoutMutation';
import { LoadingStateVariantsMap, mutationToLoadingState } from '@/lib/loading-mappers';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const LogOutModal = (props: ILogOutModalProps) => {
  const logoutMutation = useLogoutMutation();

  const logoutHandler = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => props.onClose(),
    });
  };

  return (
    <Modal {...props} isLoading={logoutMutation.isPending} size='sm'>
      <Modal.Header title='Log out' />
      <Modal.Content>
        <p>Are you sure you want to log out?</p>
      </Modal.Content>
      <Modal.Footer>
        <Button
          variant='secondary'
          className='flex-1'
          onClick={props.onClose}
          disabled={logoutMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          className='flex-1'
          variant={LoadingStateVariantsMap[mutationToLoadingState(logoutMutation)]}
          onClick={logoutHandler}
          disabled={logoutMutation.isPending}
        >
          Log out
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LogOutModal;
