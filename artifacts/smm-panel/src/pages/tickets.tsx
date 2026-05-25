import { AppLayout } from "@/components/layout/AppLayout";
  import { useListTickets, useCreateTicket } from "@workspace/api-client-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import { useState } from "react";
  import { toast } from "sonner";
  import { Ticket, Plus, X, Loader2, MessageCircle, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      open:    { label: "Terbuka",  color: "text-green-400 bg-green-400/10 border-green-400/30",   icon: <AlertCircle className="w-3 h-3" /> },
      pending: { label: "Menunggu", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: <Clock className="w-3 h-3" /> },
      closed:  { label: "Ditutup",  color: "text-gray-400 bg-gray-400/10 border-gray-400/30",      icon: <CheckCircle2 className="w-3 h-3" /> },
    };
    const s = map[status] ?? map.open;
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>{s.icon} {s.label}</span>;
  }

  export default function Tickets() {
    const { data: tickets, isLoading, refetch } = useListTickets();
    const createMutation = useCreateTicket();
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("medium");

    const handleSubmit = () => {
      if (!subject.trim() || !message.trim()) { toast.error("Isi semua field"); return; }
      createMutation.mutate({ data: { subject, message, priority } }, {
        onSuccess: () => { toast.success("Tiket berhasil dibuat!"); setShowForm(false); setSubject(""); setMessage(""); setPriority("medium"); refetch(); },
        onError: (err: any) => toast.error(err?.message || "Gagal membuat tiket"),
      });
    };

    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-display">Bantuan & Tiket</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Hubungi tim support kami</p>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl shimmer-btn text-white text-sm font-semibold hover:opacity-90 transition-all">
              <Plus className="w-4 h-4" /> Buat Tiket
            </button>
          </div>

          <div className="glass rounded-xl border border-blue-400/20 p-4 flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Jam Operasional Support</div>
              <div className="text-xs text-muted-foreground mt-0.5">Senin–Minggu, 08.00–22.00 WIB. Respons dalam 1×24 jam.</div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          ) : !(tickets as any[] | undefined)?.length ? (
            <div className="glass rounded-2xl border border-white/10 p-10 text-center">
              <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground mb-3">Belum ada tiket</p>
              <button onClick={() => setShowForm(true)} className="text-xs text-primary hover:underline">+ Buat tiket pertama kamu</button>
            </div>
          ) : (
            <div className="space-y-2">
              {(tickets as any[]).map((t: any) => (
                <div key={t.id} className="glass rounded-xl border border-white/10 hover:border-white/20 p-4 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Ticket className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{t.subject}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Tiket #{t.id} · {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${t.priority === "high" ? "text-red-400 bg-red-400/10 border-red-400/30" : t.priority === "medium" ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" : "text-gray-400 bg-gray-400/10 border-gray-400/30"}`}>
                        {t.priority === "high" ? "Tinggi" : t.priority === "medium" ? "Sedang" : "Rendah"}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <div className="glass rounded-t-2xl md:rounded-2xl border border-white/20 w-full md:max-w-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2"><Ticket className="w-4 h-4 text-primary" /> Buat Tiket Baru</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subjek</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Contoh: Order tidak diproses" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Prioritas</label>
                <div className="flex gap-2">
                  {[{value:"low",label:"Rendah"},{value:"medium",label:"Sedang"},{value:"high",label:"Tinggi"}].map((p) => (
                    <button key={p.value} onClick={() => setPriority(p.value)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${priority === p.value ? "gradient-bg text-white border-transparent" : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"}`}>{p.label}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Pesan</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Jelaskan masalah kamu secara detail..." rows={4} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm resize-none" />
              </div>
              <button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full py-3 rounded-xl shimmer-btn text-white font-semibold neon-glow hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : <><Send className="w-4 h-4" /> Kirim Tiket</>}
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }
  