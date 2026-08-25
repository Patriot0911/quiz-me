'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/enums/role.enum';
import { useAppSelector } from '@/hooks/redux';
import { authStatusSelector } from '@/hooks/redux/auth';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';
import Loading from '@/components/ui/Loading';

interface IRequireRoleProps extends PropsWithChildren {
  roles: Role[];
  redirectTo?: string;
};

const RequireRole = ({ roles, redirectTo = '/', children, }: IRequireRoleProps) => {
  const status = useAppSelector(authStatusSelector);
  const { data, isLoading, } = useMeQuery();
  const router = useRouter();

  const isAllowed = !!data && roles.includes(data.role);

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login');
      return;
    }
    if (status === 'authenticated' && !isLoading && data && !isAllowed) {
      router.replace(redirectTo);
    }
  }, [status, isLoading, data, isAllowed, redirectTo, router]);

  if (status !== 'authenticated' || isLoading || !isAllowed) return <Loading />;

  return <>{children}</>;
}

export default RequireRole;
