import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ProgramCardSkeleton = () => (
  <Card className="p-6 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-10 w-32" />
  </Card>
);

export const ApplicationCardSkeleton = () => (
  <Card className="p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
    <Skeleton className="h-4 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-9 w-24" />
      <Skeleton className="h-9 w-24" />
    </div>
  </Card>
);

export const StoryCardSkeleton = () => (
  <Card className="p-6 space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ApplicationCardSkeleton />
      <ApplicationCardSkeleton />
      <ApplicationCardSkeleton />
    </div>
  </div>
);
