import { AppLayout } from "@/components/layout/AppLayout";
import { useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";

export default function Transactions() {
  const { data: transactions, isLoading } = useListTransactions({});

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'order': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'refund': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'referral': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Transaction History</h1>

        <Card className="glass">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance After</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.map(trx => (
                      <TableRow key={trx.id} className="hover:bg-muted/20">
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(trx.type)}>
                            {trx.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{trx.description}</TableCell>
                        <TableCell className={`text-right font-medium ${trx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trx.amount > 0 ? '+' : ''}{formatRupiah(trx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatRupiah(trx.balance)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(trx.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!transactions?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                          No transactions found
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
