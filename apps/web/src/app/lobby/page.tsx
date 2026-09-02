'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import BaseLayout from '@/components/layout/BaseLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import CreateLobbyModal from '@/components/lobby/CreateLobbyModal';
import useMyLobbiesQuery from '@/hooks/queries/lobby/useMyLobbiesQuery';
import { IMyLobby } from '@/interfaces/lobby/lobby';
import { ITableColumn } from '@/interfaces/ui/table';
import { LOBBY_MODE_LABELS, LOBBY_STATUS_LABELS } from '@/configs/lobby.dictionary';
import { LobbyStatus } from '@/enums/lobby-status.enum';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const LobbyListPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const lobbiesQuery = useMyLobbiesQuery();

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
      </RequireAuth>
    </BaseLayout>
  );
};

export default LobbyListPage;
