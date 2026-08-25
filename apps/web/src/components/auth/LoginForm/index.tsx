'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useLoginMutation from '@/hooks/mutations/auth/useLoginMutation';
import { AuthLoginButtonDictionary } from '@/configs/auth.dictionary';
import { LoadingStateVariantsMap, mutationToLoadingState } from '@/lib/loading-mappers';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { loginSchema, TLoginForm } from './login.scheme';

import styles from './styles.module.scss';

const LoginForm = () => {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const methods = useForm<TLoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const loginHandler = (data: TLoginForm) => {
    loginMutation.mutate(data);
  };

  useEffect(() => {
    if (!loginMutation.isSuccess) return;
    router.replace('/');
  }, [loginMutation.isSuccess, router]);

  return (
    <div className={styles.wrapper}>
      <FormProvider {...methods}>
        <form className={styles.form} onSubmit={methods.handleSubmit(loginHandler)}>
          <h1 className={styles.title}>Sign in</h1>
          <FormInput<TLoginForm>
            name='email'
            label='Email'
            required
            autoComplete='email'
            disabled={loginMutation.isPending || loginMutation.isSuccess}
          />
          <FormInput<TLoginForm>
            name='password'
            label='Password'
            type='password'
            required
            autoComplete='current-password'
            disabled={loginMutation.isPending || loginMutation.isSuccess}
          />
          <Button
            type='submit'
            disabled={!methods.formState.isValid || loginMutation.isPending || loginMutation.isSuccess}
            variant={LoadingStateVariantsMap[mutationToLoadingState(loginMutation)]}
          >
            {AuthLoginButtonDictionary[mutationToLoadingState(loginMutation)]}
          </Button>
          <p className={styles.hint}>
            Don&apos;t have an account? <Link href='/register'>Sign up</Link>
          </p>
        </form>
      </FormProvider>
    </div>
  );
}

export default LoginForm;
