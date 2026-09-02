'use client';

import Link from 'next/link';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';
import SidebarUserProfile from '../SidebarUserProfile';
import { useAppSelector } from '@/hooks/redux';
import { authStatusSelector } from '@/hooks/redux/auth';
import Button from '@/components/ui/Button';
import { FaUserGraduate } from 'react-icons/fa';
import styles from './styles.module.scss';

const UserSection = () => {
  const status = useAppSelector(authStatusSelector);
  const { isLoading, } = useMeQuery();

  if (status === 'init' || (status === 'authenticated' && isLoading)) return null;

  return (
    <div className={styles['user-section-wrapper']}>
      {
        status === 'authenticated' ? (
          <SidebarUserProfile />
        ) : (
          <Link href='/login' className={styles['auth-link']}>
            <Button className={styles['auth-button']} size='md' leftIcon={FaUserGraduate({})}>
              Sign In
            </Button>
          </Link>
        )
      }
    </div>
  );
}

export default UserSection;
