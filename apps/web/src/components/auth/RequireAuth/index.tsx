'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { authStatusSelector } from '@/hooks/redux/auth';
import Loading from '@/components/ui/Loading';

const RequireAuth = ({ children, }: PropsWithChildren) => {
  const status = useAppSelector(authStatusSelector);
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status !== 'authenticated') return <Loading />;

  return <>{children}</>;
}

export default RequireAuth;
