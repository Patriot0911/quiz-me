import Link from 'next/link';
import BaseLayout from '@/components/layout/BaseLayout';

const HomePage = () => {
  return (
    <BaseLayout>
      <h1>Welcome</h1>
      <p>
        <Link href="/lobby/join">Приєднатись до лобі за кодом</Link>
      </p>
      <p>
        <Link href="/lobby">Мої лобі (для зареєстрованих)</Link>
      </p>
    </BaseLayout>
  );
}

export default HomePage;
