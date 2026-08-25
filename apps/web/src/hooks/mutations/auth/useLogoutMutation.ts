import { useMutation, } from '@tanstack/react-query';
import { useAppDispatch } from '../../redux';
import AuthService from '@/lib/services/auth.service';
import { logout } from '@/store/slices/authSlice';

const useLogoutMutation = () => {
  const dispatch = useAppDispatch();

  return useMutation<boolean, Error, void>({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      dispatch(logout());
    },
  });
};

export default useLogoutMutation;
