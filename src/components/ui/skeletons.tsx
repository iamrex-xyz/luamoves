import { Skeleton } from "@/components/ui/skeleton";

export const TaskSkeleton = () => {
  return (
    <div className="px-3 py-2.5 rounded-xl bg-secondary/30 border-l-4 border-l-transparent">
      <div className="flex items-start gap-3">
        <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
};

export const TaskListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="space-y-2 p-4 rounded-3xl bg-white shadow-lg shadow-primary/10">
      {Array.from({ length: count }).map((_, i) => (
        <TaskSkeleton key={i} />
      ))}
    </div>
  );
};

export const DashboardCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-primary/15 p-6">
      <div className="flex items-center gap-6">
        <Skeleton className="w-20 h-20 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
    </div>
  );
};

export const ChatMessageSkeleton = ({ isUser = false }: { isUser?: boolean }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}>
        <Skeleton className={`h-4 ${isUser ? "w-32" : "w-48"}`} />
        {!isUser && <Skeleton className="h-4 w-36 mt-2" />}
      </div>
    </div>
  );
};

export const SettingsCardSkeleton = () => {
  return (
    <div className="p-6 rounded-3xl bg-white shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};
