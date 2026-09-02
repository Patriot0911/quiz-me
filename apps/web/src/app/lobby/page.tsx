'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { LuTrash2 } from 'react-icons/lu';
import BaseLayout from '@/components/layout/BaseLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import CreateLobbyModal from '@/components/lobby/CreateLobbyModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import useMyLobbiesQuery from '@/hooks/queries/lobby/useMyLobbiesQuery';
import useCloseLobbyMutation from '@/hooks/mutations/lobby/useCloseLobbyMutation';
import { mutationToLoadingState } from '@/lib/loading-mappers';
import { IMyLobby } from '@/interfaces/lobby/lobby';
import { ITableAction, ITableColumn } from '@/interfaces/ui/table';
import { LOBBY_MODE_LABELS, LOBBY_STATUS_LABELS } from '@/configs/lobby.dictionary';
import { LobbyStatus } from '@/enums/lobby-status.enum';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const LobbyListPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<IMyLobby | null>(null);
  const lobbiesQuery = useMyLobbiesQuery();
  const closeLobbyMutation = useCloseLobbyMutation();

  const handleCloseConfirm = () => {
    if (!closeTarget) return;
    closeLobbyMutation.mutate(closeTarget.code, {
      onSuccess: () => {
        toast.success('Лобі закрито');
        setCloseTarget(null);
      },
      onError: () => {
        toast.error('Не вдалося закрити лобі');
      },
    });
  };

  const actions: ITableAction<IMyLobby>[] = [
    {
      key: 'close',
      icon: <LuTrash2 size={16} />,
      label: 'Закрити лобі',
      variant: 'danger',
      disabled: (row) => row.status !== LobbyStatus.OPEN,
      onClick: (row) => setCloseTarget(row),
    },
  ];

  const columns: ITableColumn<IMyLobby>[] = [
    { key: 'title', title: 'Назва', dataBind: 'title' },
    { key: 'code', title: 'Код', dataBind: 'code' },
    { key: 'mode', title: 'Режим', render: (row) => LOBBY_MODE_LABELS[row.mode] },
    {
      key: 'status',
      title: 'Статус',
      render: (row) => (
        <span
          className={cn(
            row.status === LobbyStatus.OPEN ? styles.statusOpen : styles.statusClosed,
          )}
        >
          {LOBBY_STATUS_LABELS[row.status]}
        </span>
      ),
    },
    { key: 'participants', title: 'Учасники', align: 'center', render: (row) => row.participantCount },
    {
      key: 'createdAt',
      title: 'Створено',
      render: (row) => dayjs(row.createdAt).format('DD.MM.YYYY HH:mm'),
    },
    {
      key: 'link',
      title: '',
      render: (row) => (
        <Link className={styles.link} href={`/lobby/host/${row.code}`}>
          Відкрити
        </Link>
      ),
    },
  ];

  return (
    <BaseLayout>
      <RequireAuth>
        <div className={styles.wrapper}>
          <header className={styles.header}>
            <h1 className={styles.title}>Мої лобі</h1>
            <Button onClick={() => setIsCreateOpen(true)}>Створити лобі</Button>
          </header>

          <Table
            columns={columns}
            actions={actions}
            data={lobbiesQuery.data ?? []}
            rowKey="id"
            isLoading={lobbiesQuery.isLoading}
            emptyText="У вас ще немає жодного лобі"
          >
            <Table.Header />
            <Table.Body />
          </Table>
        </div>

        <CreateLobbyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

        <ConfirmModal
          isOpen={closeTarget !== null}
          onClose={() => setCloseTarget(null)}
          onConfirm={handleCloseConfirm}
          description={`Закрити лобі "${closeTarget?.title}"? Приєднатися до нього знову буде неможливо.`}
          requestState={mutationToLoadingState(closeLobbyMutation)}
        />
      </RequireAuth>
    </BaseLayout>
  );
};

export default LobbyListPage;
