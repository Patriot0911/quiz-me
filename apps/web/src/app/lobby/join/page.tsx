'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import styles from './styles.module.scss';

const JoinLobbyEntryPage = () => {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/lobby/join/${trimmed.toUpperCase()}`);
  };

  return (
    <BaseLayout>
      <div className={styles.wrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Приєднатись до лобі</h1>
          <Input
            label="Код лобі"
            placeholder="Наприклад, AB12CD"
            value={code}
            maxLength={12}
            onChange={(event) => setCode(event.target.value)}
          />
          <Button type="submit" disabled={!code.trim()}>
            Продовжити
          </Button>
        </form>
      </div>
    </BaseLayout>
  );
};

export default JoinLobbyEntryPage;
