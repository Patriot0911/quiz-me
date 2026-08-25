import { useMutation, useQueryClient, } from '@tanstack/react-query';
import { useAppDispatch } from '../../redux';
import AuthService, { AuthQueryKey } from '@/lib/services/auth.service';
import { login, logout } from '@/store/slices/authSlice';
import { IAuthUser } from '@/interfaces/auth/user';
import { IRegisterRequestPayload, IRegisterResponse } from '@/interfaces/auth/register';

const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation<IRegisterResponse, Error, IRegisterRequestPayload>({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      dispatch(login(data.tokens));
      queryClient.setQueryData(
        [AuthQueryKey.Me],
        data.user satisfies IAuthUser
      );
    },
    onError: () => {
      dispatch(logout());
    },
  });
};

export default useRegisterMutation;
