'use client';

import { useEffect, useState } from 'react';

const isDev = process.env.NODE_ENV === 'development';

export default function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!isDev);

  useEffect(() => {
    if (!isDev) return;

    import('@/mocks').then(({ initMocks }) => {
      initMocks().then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
