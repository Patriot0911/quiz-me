'use client';

import Table from '@/components/ui/Table';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { ParticipantStatus } from '@/enums/participant-status.enum';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { ITableColumn } from '@/interfaces/ui/table';
import { ISnapshotParticipant } from '@/interfaces/lobby/snapshot';

import styles from './styles.module.scss';

const ParticipantList = () => {
  const { snapshot } = useLobbyRoom();

  const participants = snapshot?.participants ?? [];
  const queueRank = new Map<string, number>();
  snapshot?.queue.forEach((entry, index) => queueRank.set(entry.participantId, index + 1));

  const columns: ITableColumn<ISnapshotParticipant>[] = [
    { key: 'nickname', title: 'Нікнейм', dataBind: 'nickname' },
    {
      key: 'status',
      title: 'Статус',
      render: (row) => {
        if (snapshot?.lockedBy?.participantId === row.id) {
          return <span className={styles.badgeLocked}>Заблокував(ла) кнопку</span>;
        }
        if (row.status === ParticipantStatus.TIMED_OUT) {
          return <span className={styles.badgeTimeout}>Таймаут</span>;
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

  return (
    <Table
      columns={columns}
      data={participants}
      rowKey="id"
      emptyText="Ще ніхто не приєднався"
    >
      <Table.Header />
      <Table.Body />
    </Table>
  );
};

export default ParticipantList;
