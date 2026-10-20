import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';

export const KpiCardsSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-hidden>
    {Array.from({ length: 6 }, (_, index) => (
      <Card key={index} size="sm">
        <CardHeader>
          <Skeleton className="h-3 w-24" />
        </CardHeader>
        <CardContent className="gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// A card of the given height, for the ones that only differ in how tall they are
export const CardSkeleton = ({ className }: { className?: string }) => (
  <Card className="h-full" aria-hidden>
    <CardHeader>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-56" />
    </CardHeader>
    <CardContent>
      <Skeleton className={className ?? 'h-48 w-full'} />
    </CardContent>
  </Card>
);
