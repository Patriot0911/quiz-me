'use client';

import { useState } from 'react';
import { LoadingState, LoadingStateVariantsMap } from '@/lib/loading-mappers';
import { ConfirmModalButtonDictionary } from '@/configs/modal.dictionary';
import { IConfirmModalProps } from '@/interfaces/shared/modal';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

import styles from './styles.module.scss';

const ConfirmModal = (props: IConfirmModalProps) => {
  const [confirmWord, setConfirmWord] = useState<string>('')
  const [wasOpen, setWasOpen] = useState(props.isOpen);

  if (props.isOpen !== wasOpen) {
    setWasOpen(props.isOpen);
    if (!props.isOpen) {
      setConfirmWord('');
    }
  }

  return (
    <Modal
      {...props}
      isLoading={props.requestState === LoadingState.Loading}
      size={'md'}
    >
      <Modal.FormBody onSubmit={props.onConfirm}>
        <Modal.Header
          title={'Confirmation'}
        />
        <Modal.Content>
          {!!props.description && <p className={styles['description']}>{props.description}</p>}
          {!!props.confirmationWord && (
            <Input
              name={'confirmWord'}
              label='Confirmation word'
              placeholder={props.confirmationWord}
              onChange={(e) => setConfirmWord(e.target.value)}
              disabled={!!props.requestState && props.requestState !== LoadingState.Ide}
            />
          )}
        </Modal.Content>
        <Modal.Footer>
          <Button
            className={'flex-1'}
            disabled={props.requestState === LoadingState.Pendding}
            variant={'secondary'}
            onClick={props.onClose}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className={'flex-1'}
            disabled={
              (!!props.confirmationWord && props.confirmationWord !== confirmWord)
              || props.requestState !== LoadingState.Ide
              || props.disabled
            }
            variant={LoadingStateVariantsMap[props.requestState ?? LoadingState.Ide]}
          >
            {ConfirmModalButtonDictionary[props.requestState ?? LoadingState.Ide]}
          </Button>
        </Modal.Footer>
      </Modal.FormBody>
    </Modal>
  );
}

export default ConfirmModal;
