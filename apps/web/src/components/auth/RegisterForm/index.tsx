'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useRegisterMutation from '@/hooks/mutations/auth/useRegisterMutation';
import { AuthRegisterButtonDictionary } from '@/configs/auth.dictionary';
import { LoadingStateVariantsMap, mutationToLoadingState } from '@/lib/loading-mappers';
import FormInput from '@/components/ui/FormInput';
import Button from '@/components/ui/Button';
import { registerSchema, TRegisterForm } from './register.scheme';

import styles from '../LoginForm/styles.module.scss';

const RegisterForm = () => {
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const methods = useForm<TRegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const registerHandler = (data: TRegisterForm) => {
    registerMutation.mutate(data);
  };

  useEffect(() => {
    if (!registerMutation.isSuccess) return;
    router.replace('/');
  }, [registerMutation.isSuccess, router]);

  return (
    <div className={styles.wrapper}>
      <FormProvider {...methods}>
        <form className={styles.form} onSubmit={methods.handleSubmit(registerHandler)}>
          <h1 className={styles.title}>Sign up</h1>
          <FormInput<TRegisterForm>
            name='fullName'
            label='Full name'
            required
            autoComplete='name'
            disabled={registerMutation.isPending || registerMutation.isSuccess}
          />
          <FormInput<TRegisterForm>
            name='email'
            label='Email'
            required
            autoComplete='email'
            disabled={registerMutation.isPending || registerMutation.isSuccess}
          />
          <FormInput<TRegisterForm>
            name='password'
            label='Password'
            type='password'
            required
            autoComplete='new-password'
            disabled={registerMutation.isPending || registerMutation.isSuccess}
          />
          <Button
            type='submit'
            disabled={!methods.formState.isValid || registerMutation.isPending || registerMutation.isSuccess}
            variant={LoadingStateVariantsMap[mutationToLoadingState(registerMutation)]}
          >
            {AuthRegisterButtonDictionary[mutationToLoadingState(registerMutation)]}
          </Button>
          <p className={styles.hint}>
            Already have an account? <Link href='/login'>Sign in</Link>
          </p>
        </form>
      </FormProvider>
    </div>
  );
}

export default RegisterForm;
