'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import BaseLayout from '@/components/layout/BaseLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import useCreateLobbyMutation from '@/hooks/mutations/lobby/useCreateLobbyMutation';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import {
  createLobbySchema,
  TCreateLobbyFormInput,
  TCreateLobbyFormOutput,
} from './create-lobby.scheme';

import styles from './styles.module.scss';

const MODE_LABELS: Record<LobbyMode, string> = {
  [LobbyMode.FIRST_LOCK]: 'а) Перший тисне — блокує всіх',
  [LobbyMode.FIRST_LOCK_JUDGED]: 'а-2) Перший тисне — з оцінкою хоста',
  [LobbyMode.QUEUE]: 'б) Черга — тиснуть всі',
};

const CreateLobbyPage = () => {
  const router = useRouter();
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
      onSuccess: (lobby) => router.push(`/lobby/host/${lobby.code}`),
      onError: () => toast.error('Не вдалося створити лобі'),
    });
  };

  return (
    <BaseLayout>
      <RequireAuth>
        <div className={styles.wrapper}>
          <FormProvider {...methods}>
            <form className={styles.form} onSubmit={methods.handleSubmit(onSubmit)}>
              <h1 className={styles.title}>Створити лобі</h1>

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
                      {MODE_LABELS[value]}
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

              <Button
                type="submit"
                disabled={!methods.formState.isValid || createLobbyMutation.isPending}
                isLoading={createLobbyMutation.isPending}
              >
                Створити лобі
              </Button>
            </form>
          </FormProvider>
        </div>
      </RequireAuth>
    </BaseLayout>
  );
};

export default CreateLobbyPage;
