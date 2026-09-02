'use client';

import { useState } from 'react';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';
import Button from '@/components/ui/Button';
import LogOutModal from '@/components/auth/LogOutModal';

import styles from './styles.module.scss';

const SidebarUserProfile = () => {
  const { data, } = useMeQuery();
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);

  if (!data) return null;

  return (
    <div className={styles['user-profile-wrapper']}>
      <LogOutModal isOpen={isLogOutModalOpen} onClose={() => setIsLogOutModalOpen(false)} />
      <Button
        className={styles['logout-button']}
        size='md'
        variant={'danger'}
        onClick={() => setIsLogOutModalOpen(true)}
      >
        Log out
      </Button>
    </div>
  );
}

export default SidebarUserProfile;
