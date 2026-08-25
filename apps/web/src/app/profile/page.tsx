'use client';

import BaseLayout from '@/components/layout/BaseLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import useMeQuery from '@/hooks/queries/auth/useMeQuery';

const ProfilePage = () => {
  const { data, } = useMeQuery();

  return (
    <BaseLayout>
      <RequireAuth>
        {data && (
          <div>
            <h1>{data.fullName}</h1>
            <p>{data.email}</p>
            <p>{data.role}</p>
          </div>
        )}
      </RequireAuth>
    </BaseLayout>
  );
}

export default ProfilePage;
