'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LuPencil, LuTimerReset, LuUserX } from 'react-icons/lu';
import Table from '@/components/ui/Table';
import ConfirmModal from '@/components/modals/ConfirmModal';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import RenameParticipantModal from '../RenameParticipantModal';
import { ParticipantStatus } from '@/enums/participant-status.enum';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LoadingState } from '@/lib/loading-mappers';
import { ITableAction, ITableColumn } from '@/interfaces/ui/table';
import { ISnapshotParticipant } from '@/interfaces/lobby/snapshot';

import styles from './styles.module.scss';

const ParticipantList = () => {
  const { snapshot, resetParticipantTimeout, kickParticipant } = useLobbyRoom();
  const [now, setNow] = useState(() => Date.now());
  const [renameTarget, setRenameTarget] = useState<ISnapshotParticipant | null>(null);
  const [kickTarget, setKickTarget] = useState<ISnapshotParticipant | null>(null);
  const [kickState, setKickState] = useState<LoadingState>(LoadingState.Ide);

  const hasActiveTimeouts = (snapshot?.participants ?? []).some(
    (p) => p.status === ParticipantStatus.TIMED_OUT,
  );

  useEffect(() => {
    if (!hasActiveTimeouts) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasActiveTimeouts]);

  const isLiveTimedOut = (row: ISnapshotParticipant) => {
    if (row.status !== ParticipantStatus.TIMED_OUT) return false;
    if (!row.timeoutUntil) return true;
    return new Date(row.timeoutUntil).getTime() > now;
  };

  const participants = snapshot?.participants ?? [];
  const queueRank = new Map<string, number>();
  snapshot?.queue.forEach((entry, index) => queueRank.set(entry.participantId, index + 1));

  const handleResetTimeout = async (row: ISnapshotParticipant) => {
    const result = await resetParticipantTimeout(row.id);
    if (!result.ok) toast.error('Не вдалося скинути таймаут');
  };

  const handleKickConfirm = async () => {
    if (!kickTarget) return;
    setKickState(LoadingState.Pendding);
    const result = await kickParticipant(kickTarget.id);
    if (result.ok) {
      setKickState(LoadingState.Ide);
      setKickTarget(null);
    } else {
      setKickState(LoadingState.Ide);
      toast.error('Не вдалося видалити учасника');
    }
  };

  const columns: ITableColumn<ISnapshotParticipant>[] = [
    { key: 'nickname', title: 'Нікнейм', dataBind: 'nickname' },
    {
      key: 'status',
      title: 'Статус',
      render: (row) => {
        if (snapshot?.lockedBy?.participantId === row.id) {
          return <span className={styles.badgeLocked}>Заблокував(ла) кнопку</span>;
        }
        if (isLiveTimedOut(row)) {
          const remaining = row.timeoutUntil
            ? Math.max(0, Math.ceil((new Date(row.timeoutUntil).getTime() - now) / 1000))
            : null;
          return (
            <span className={styles.badgeTimeout}>
              Таймаут{remaining !== null ? ` (${remaining}с)` : ''}
            </span>
          );
        }
        if (snapshot?.lobby.mode === LobbyMode.QUEUE && queueRank.has(row.id)) {
          return <span className={styles.badgeQueue}>#{queueRank.get(row.id)} у черзі</span>;
        }
        return <span className={styles.badgeActive}>Активний(а)</span>;
      },
    },
    {
      key: 'connected',
      title: 'Зв’язок',
      width: 90,
      align: 'center',
      render: (row) => (row.connected ? '🟢' : '⚪'),
    },
  ];

  const actions: ITableAction<ISnapshotParticipant>[] = [
    {
      key: 'reset-timeout',
      icon: <LuTimerReset size={16} />,
      label: 'Скинути таймаут',
      disabled: (row) => !isLiveTimedOut(row),
      onClick: (row) => void handleResetTimeout(row),
    },
    {
      key: 'rename',
      icon: <LuPencil size={16} />,
      label: 'Змінити нікнейм',
      onClick: (row) => setRenameTarget(row),
    },
    {
      key: 'kick',
      icon: <LuUserX size={16} />,
      label: 'Кікнути',
      variant: 'danger',
      onClick: (row) => setKickTarget(row),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        actions={actions}
        data={participants}
        rowKey="id"
        emptyText="Ще ніхто не приєднався"
      >
        <Table.Header />
        <Table.Body />
      </Table>

      <RenameParticipantModal
        isOpen={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        participantId={renameTarget?.id ?? null}
        currentNickname={renameTarget?.nickname ?? ''}
      />

      <ConfirmModal
        isOpen={kickTarget !== null}
        onClose={() => setKickTarget(null)}
        onConfirm={() => void handleKickConfirm()}
        description={`Видалити учасника "${kickTarget?.nickname}" з лобі? Цю дію не можна скасувати.`}
        requestState={kickState}
      />
    </>
  );
};

export default ParticipantList;
