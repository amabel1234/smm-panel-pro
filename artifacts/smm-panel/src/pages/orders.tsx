import { AppLayout } from "@/components/layout/AppLayout";
import { useListOrders, useRefillOrder } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RotateCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Orders() {
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useListOrders({ status: status || undefined }, { query: { refetchInterval: 30000 }});
  const refillMutation = useRefillOrder();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'partial': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refunded': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleRefill = (id: number) => {
    refillMutation.mutate({ id }, {
      onSuccess: () => toast.success("Refill requested successfully"),
      onError: (err: any) => toast.error(err.message || "Failed to request refill")
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Order History</h1>
        
        <Tabs defaultValue="all" value={status} onValueChange={setStatus} className="w-full">
          <TabsList className="glass border border-border/50 bg-muted/20 overflow-x-auto flex w-full justify-start md:justify-center p-1 h-12">
            <TabsTrigger value="" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">All Orders</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">Pending</TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">Processing</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">Completed</TabsTrigger>
            <TabsTrigger value="partial" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">Partial</TabsTrigger>
            <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card className="glass overflow-hidden border-primary/10">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.orders?.map(order => (
                      <TableRow key={order.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium text-muted-foreground">#{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium line-clamp-1 max-w-[200px]">{order.serviceName}</div>
                          <div className="text-xs text-muted-foreground">{order.platform}</div>
                        </TableCell>
                        <TableCell>
                          <a href={order.link} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm max-w-[150px] truncate">
                            Link <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{order.quantity.toLocaleString()}</div>
                          <div className="text-xs text-primary">{formatRupiah(order.price)}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Refill" 
                              onClick={() => handleRefill(order.id)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 w-8"
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!data?.orders?.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
                            <p>No orders found matching this status.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
