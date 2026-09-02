'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLobbyRoom } from '../LobbyRoomProvider/context';

interface IRenameParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantId: string | null;
  currentNickname: string;
}

const RenameParticipantModal = ({
  isOpen,
  onClose,
  participantId,
  currentNickname,
}: IRenameParticipantModalProps) => {
  const { renameParticipant } = useLobbyRoom();
  const [nickname, setNickname] = useState(currentNickname);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initializes the editable field when the modal opens
    setNickname(currentNickname);
  }, [isOpen, currentNickname]);

  const handleSubmit = async () => {
    const trimmed = nickname.trim();
    if (!participantId || !trimmed) return;

    setIsSaving(true);
    const result = await renameParticipant(participantId, trimmed);
    setIsSaving(false);

    if (result.ok) {
      onClose();
      return;
    }

    toast.error(
      result.reason === 'nickname-taken'
        ? 'Такий нікнейм вже зайнятий у цьому лобі'
        : 'Не вдалося змінити нікнейм',
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isLoading={isSaving} size="sm">
      <Modal.Header title="Змінити нікнейм" />
      <Modal.Content>
        <Input
          label="Новий нікнейм"
          value={nickname}
          maxLength={32}
          onChange={(event) => setNickname(event.target.value)}
        />
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSaving}>
          Скасувати
        </Button>
        <Button
          className="flex-1"
          onClick={() => void handleSubmit()}
          disabled={!nickname.trim() || isSaving}
          isLoading={isSaving}
        >
          Зберегти
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RenameParticipantModal;
