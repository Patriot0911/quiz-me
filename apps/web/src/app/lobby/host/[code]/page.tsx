'use client';

import { useParams } from 'next/navigation';
import BaseLayout from '@/components/layout/BaseLayout';
import RequireAuth from '@/components/auth/RequireAuth';
import AuthService from '@/lib/services/auth.service';
import LobbyRoomProvider from '@/components/lobby/LobbyRoomProvider';
import HostControlPanel from '@/components/lobby/HostControlPanel';

const HostLobbyPage = () => {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();
  const token = AuthService.getToken();

  return (
    <BaseLayout>
      <RequireAuth>
        {token && (
          <LobbyRoomProvider role="host" auth={{ token, code }} key={code}>
            <HostControlPanel code={code} />
          </LobbyRoomProvider>
        )}
      </RequireAuth>
    </BaseLayout>
  );
};

export default HostLobbyPage;
