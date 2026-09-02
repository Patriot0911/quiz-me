'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LOBBY_MODE_LABELS } from '@/configs/lobby.dictionary';

import styles from './styles.module.scss';

const HostModeSettings = () => {
  const { snapshot, updateSettings } = useLobbyRoom();
  const [mode, setMode] = useState<LobbyMode>(LobbyMode.FIRST_LOCK);
  const [timeoutSeconds, setTimeoutSeconds] = useState(15);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!snapshot) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the editable local copy from the live snapshot
    setMode(snapshot.lobby.mode);
    setTimeoutSeconds(snapshot.lobby.timeoutSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-syncs only when these two primitives change
  }, [snapshot?.lobby.mode, snapshot?.lobby.timeoutSeconds]);

  if (!snapshot) return null;

  const isIdle = snapshot.lobby.roundState === LobbyRoundState.IDLE;

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateSettings({ mode, timeoutSeconds });
    setIsSaving(false);
    if (!result.ok) toast.error('Не вдалося оновити налаштування');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.field}>
        <label className={styles.label}>Режим раунду</label>
        <select
          value={mode}
          disabled={!isIdle}
          onChange={(event) => setMode(event.target.value as LobbyMode)}
          className={styles.select}
        >
          {Object.values(LobbyMode).map((value) => (
            <option key={value} value={value}>
              {LOBBY_MODE_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {mode === LobbyMode.FIRST_LOCK_JUDGED && (
        <Input
          label="Таймаут за неправильну відповідь (сек)"
          type="number"
          min={1}
          max={600}
          disabled={!isIdle}
          value={timeoutSeconds}
          onChange={(event) => setTimeoutSeconds(Number(event.target.value))}
        />
      )}

      <Button onClick={() => void handleSave()} disabled={!isIdle} isLoading={isSaving}>
        Зберегти налаштування
      </Button>

      {!isIdle && (
        <p className={styles.hint}>
          Налаштування можна змінити лише поки раунд не активний
        </p>
      )}
    </div>
  );
};

export default HostModeSettings;
