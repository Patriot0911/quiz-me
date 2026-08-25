import { useAppDispatch } from '@/hooks/redux';
import { initAuth } from '@/store/slices/authSlice';
import { PropsWithChildren, useEffect, useRef } from 'react';

const AuthProvider = ({ children, }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) {
      return;
    }
    done.current = true;
    dispatch(initAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default AuthProvider;
