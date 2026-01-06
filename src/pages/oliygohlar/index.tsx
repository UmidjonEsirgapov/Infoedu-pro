// Redirect to /oliygoh
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OliygohlarRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/oliygoh');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-600">Qayta yo'naltirilmoqda...</p>
    </div>
  );
}

