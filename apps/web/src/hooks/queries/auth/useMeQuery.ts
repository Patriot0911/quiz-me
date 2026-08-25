import { useAppSelector } from '@/hooks/redux';
import { authSelector } from '@/hooks/redux/auth';
import { IAuthMeResponse } from '@/interfaces/auth/me';
import AuthService, { AuthQueryKey } from '@/lib/services/auth.service';
import { useQuery } from '@tanstack/react-query';

const useMeQuery = () => {
  const { status, } = useAppSelector(authSelector);

  return useQuery<IAuthMeResponse, Error, IAuthMeResponse>({
    queryKey: [AuthQueryKey.Me],
    queryFn: AuthService.getMeUser,
    retry: false,
    select: (data) => data,
    enabled: status === 'authenticated',
  });
}

export default useMeQuery;
