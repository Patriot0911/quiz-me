'use client';

import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import useCreateLobbyMutation from '@/hooks/mutations/lobby/useCreateLobbyMutation';
import { useQueryClient } from '@tanstack/react-query';
import { LobbyQueryKey } from '@/lib/services/lobby.service';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { IModalBaseProps } from '@/interfaces/shared/modal';
import { LOBBY_MODE_LABELS } from '@/configs/lobby.dictionary';
import {
  createLobbySchema,
  TCreateLobbyFormInput,
  TCreateLobbyFormOutput,
} from './create-lobby.scheme';

import styles from './styles.module.scss';

const CreateLobbyModal = ({ isOpen, onClose }: IModalBaseProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createLobbyMutation = useCreateLobbyMutation();

  const methods = useForm<TCreateLobbyFormInput, unknown, TCreateLobbyFormOutput>({
    resolver: zodResolver(createLobbySchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      mode: LobbyMode.FIRST_LOCK,
      timeoutSeconds: 15,
    },
  });

  const onSubmit = (data: TCreateLobbyFormOutput) => {
    createLobbyMutation.mutate(data, {
      onSuccess: (lobby) => {
        methods.reset();
        void queryClient.invalidateQueries({ queryKey: [LobbyQueryKey.MyLobbies] });
        onClose();
        router.push(`/lobby/host/${lobby.code}`);
      },
      onError: () => toast.error('Не вдалося створити лобі'),
    });
  };

  const handleClose = () => {
    if (createLobbyMutation.isPending) return;
    methods.reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isLoading={createLobbyMutation.isPending} size="md">
      <FormProvider {...methods}>
        <Modal.FormBody onSubmit={methods.handleSubmit(onSubmit)}>
          <Modal.Header title="Створити лобі" />
          <Modal.Content className={styles.content}>
            <FormInput<TCreateLobbyFormInput>
              name="title"
              label="Назва лобі"
              required
              disabled={createLobbyMutation.isPending}
            />

            <div className={styles.field}>
              <label className={styles.label}>Режим раунду</label>
              <select className={styles.select} {...methods.register('mode')}>
                {Object.values(LobbyMode).map((value) => (
                  <option key={value} value={value}>
                    {LOBBY_MODE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <FormInput<TCreateLobbyFormInput>
              name="timeoutSeconds"
              label="Таймаут за неправильну відповідь (сек)"
              type="number"
              disabled={createLobbyMutation.isPending}
            />
          </Modal.Content>
          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleClose}
              disabled={createLobbyMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!methods.formState.isValid || createLobbyMutation.isPending}
              isLoading={createLobbyMutation.isPending}
            >
              Створити
            </Button>
          </Modal.Footer>
        </Modal.FormBody>
      </FormProvider>
    </Modal>
  );
};

export default CreateLobbyModal;
