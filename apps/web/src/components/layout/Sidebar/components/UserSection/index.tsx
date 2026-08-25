'use client';

import Link from 'next/link';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';
import SidebarUserProfile from '../SidebarUserProfile';
import { useAppSelector } from '@/hooks/redux';
import { authStatusSelector } from '@/hooks/redux/auth';
import Button from '@/components/ui/Button';
import { FaUserGraduate } from 'react-icons/fa';
import { ISidebarSectionProps } from '@/interfaces/layout/sidebar';

import styles from './styles.module.scss';

const UserSection = ({ isOpen }: ISidebarSectionProps) => {
  const status = useAppSelector(authStatusSelector);
  const { isLoading, } = useMeQuery();

  if (status === 'init' || (status === 'authenticated' && isLoading)) return null;

  return (
    <div className={styles['user-section-wrapper']}>
      {
        status === 'authenticated' ? (
          <SidebarUserProfile isOpen={isOpen} />
        ) : (
          <Link href='/login'>
            <Button leftIcon={FaUserGraduate({})}>
              {isOpen ? 'Sign In' : ''}
            </Button>
          </Link>
        )
      }
    </div>
  );
}

export default UserSection;
