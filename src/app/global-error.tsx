'use client';

import React, { useEffect } from 'react';
import './globals.css';

// Replaces the root layout when it fails, so it brings its own document and can't use the app's
// providers or theme
const GlobalError = ({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        className={'bg-background text-foreground flex min-h-screen items-center justify-center'}
      >
        <title>Something went wrong | CvTracker</title>
        <div className={'flex max-w-sm flex-col items-center gap-3 p-6 text-center'}>
          <h1 className={'text-lg font-semibold'}>Something went wrong</h1>
          <p className={'text-muted-foreground text-sm'}>
            An unexpected error occurred. Try again, and if it keeps happening, come back later.
            {error.digest && <span className={'mt-2 block text-xs'}>Error ID: {error.digest}</span>}
          </p>
          <button
            onClick={() => retry()}
            className={
              'bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium'
            }
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
