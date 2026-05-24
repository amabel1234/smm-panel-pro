import { AppLayout } from "@/components/layout/AppLayout";
import { useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading } = useListNotifications();

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Notifications</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {notifications?.map(notif => (
              <Card key={notif.id} className={`glass ${!notif.isRead ? 'border-primary/50' : ''}`}>
                <CardContent className="p-4 flex gap-4">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Bell className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{notif.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{notif.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">{new Date(notif.createdAt).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!notifications?.length && (
              <div className="text-center p-8 glass rounded-xl text-muted-foreground">
                No notifications found
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
