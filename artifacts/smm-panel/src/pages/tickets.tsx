import { AppLayout } from "@/components/layout/AppLayout";
import { useListTickets } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Tickets() {
  const { data: tickets, isLoading } = useListTickets();

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Support Tickets</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {tickets?.map(ticket => (
              <Card key={ticket.id} className="glass hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground mt-1">Ticket #{ticket.id}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{ticket.priority}</Badge>
                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!tickets?.length && (
              <div className="text-center p-8 glass rounded-xl text-muted-foreground">
                No tickets found
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
