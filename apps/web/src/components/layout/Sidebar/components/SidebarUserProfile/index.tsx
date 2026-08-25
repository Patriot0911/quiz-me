'use client';

import { useState } from 'react';
import { FaUserGraduate } from 'react-icons/fa6';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';
import { ISidebarSectionProps } from '@/interfaces/layout/sidebar';
import Button from '@/components/ui/Button';
import LogOutModal from '@/components/auth/LogOutModal';

import styles from './styles.module.scss';

const SidebarUserProfile = ({ isOpen }: ISidebarSectionProps) => {
  const { data, } = useMeQuery();
  const [isLogOutModalOpen, setIsLogOutModalOpen] = useState(false);

  if (!data) return null;

  return (
    <div className={styles['user-profile-wrapper']}>
      <LogOutModal isOpen={isLogOutModalOpen} onClose={() => setIsLogOutModalOpen(false)} />
      <div className={styles['avatar-wrapper']}>
        <FaUserGraduate />
      </div>
      {
        isOpen && (
          <div className={styles['user-info']}>
            <span className={styles['user-name']}>{data.fullName}</span>
            <span className={styles['user-role']}>{data.role}</span>
          </div>
        )
      }
      <div className={styles['logout-wrapper']}>
        <Button variant={'danger'} onClick={() => setIsLogOutModalOpen(true)}>
          {isOpen ? 'Log out' : ''}
        </Button>
      </div>
    </div>
  );
}

export default SidebarUserProfile;
