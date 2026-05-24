import { AppLayout } from "@/components/layout/AppLayout";
import { useListNokosCountries, useListNokosApps, useListActiveNumbers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils";

export default function Nokos() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { data: countries, isLoading: isLoadingCountries } = useListNokosCountries();
  const { data: apps, isLoading: isLoadingApps } = useListNokosApps(
    { country: selectedCountry || undefined }, 
    { query: { enabled: !!selectedCountry, queryKey: ['nokos-apps', selectedCountry] } }
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-display">Virtual Numbers</h1>
        
        {!selectedCountry ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Country</h2>
            {isLoadingCountries ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {countries?.map(country => (
                  <Card key={country.code} className="glass cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedCountry(country.code)}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl mb-2">{country.flag}</div>
                      <div className="text-sm font-medium">{country.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button className="text-primary hover:underline text-sm font-medium" onClick={() => setSelectedCountry(null)}>
                ← Back to Countries
              </button>
              <h2 className="text-xl font-semibold">Select App</h2>
            </div>
            
            {isLoadingApps ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {apps?.map(app => (
                  <Card key={app.id} className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{app.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-primary font-bold">{formatRupiah(app.price)}</span>
                        <span className="text-muted-foreground">Stock: {app.stock}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
