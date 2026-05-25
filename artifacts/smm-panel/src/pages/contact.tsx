import { AppLayout } from "@/components/layout/AppLayout";
  import { SiTelegram, SiWhatsapp } from "react-icons/si";
  import { Phone, MessageCircle, Send, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
  import { toast } from "sonner";
  import { useState } from "react";

  const contacts = [
    {
      id: "wa-chat",
      type: "WhatsApp",
      label: "Chat Langsung",
      value: "+62 831-8279-1150",
      href: "https://wa.me/6283182791150",
      description: "Chat langsung dengan owner",
      icon: SiWhatsapp,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
      glow: "hover:shadow-green-400/20",
      badge: "Online",
      badgeColor: "bg-green-400/20 text-green-400",
    },
    {
      id: "wa-channel",
      type: "WhatsApp",
      label: "Saluran WhatsApp",
      value: "Nixx SMM Channel",
      href: "https://whatsapp.com/channel/0029VbD0FGPIyPtQjZZNrA1Q",
      description: "Follow untuk info promo & update terbaru",
      icon: SiWhatsapp,
      color: "text-green-400",
      bg: "bg-green-400/10",
      border: "border-green-400/20",
      glow: "hover:shadow-green-400/20",
      badge: "Channel",
      badgeColor: "bg-green-400/20 text-green-400",
    },
    {
      id: "tg-channel",
      type: "Telegram",
      label: "Saluran Telegram",
      value: "@nixsukakamu",
      href: "https://t.me/nixsukakamu",
      description: "Update layanan & promo eksklusif",
      icon: SiTelegram,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
      glow: "hover:shadow-sky-400/20",
      badge: "Channel",
      badgeColor: "bg-sky-400/20 text-sky-400",
    },
  ];

  export default function Contact() {
    const [copied, setCopied] = useState("");

    const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopied(id);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(""), 2000);
    };

    return (
      <AppLayout>
        <div className="space-y-5 max-w-xl mx-auto">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold font-display">Kontak & Owner</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Hubungi kami kapan saja</p>
          </div>

          {/* Hero card */}
          <div className="relative glass rounded-2xl border border-primary/20 p-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-2xl font-black neon-glow shrink-0">
                N
              </div>
              <div>
                <div className="text-lg font-bold">Nix — Owner</div>
                <div className="text-sm text-muted-foreground mt-0.5">Admin & Pengelola Nixx SMM</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Aktif · Respons cepat</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Jam Aktif",    value: "08–22" },
                { label: "Respon",       value: "< 1 jam" },
                { label: "Layanan",      value: "24/7" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl py-2.5">
                  <div className="text-sm font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact cards */}
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id}
                className={"glass rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg " + c.border + " " + c.glow}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 " + c.bg}>
                    <c.icon className={"w-6 h-6 " + c.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">{c.label}</span>
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + c.badgeColor}>{c.badge}</span>
                    </div>
                    <div className={"text-sm font-mono mt-0.5 " + c.color}>{c.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.description}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <a href={c.href} target="_blank" rel="noopener noreferrer"
                      className={"p-2 rounded-xl transition-all " + c.bg + " hover:opacity-80"}>
                      <ExternalLink className={"w-4 h-4 " + c.color} />
                    </a>
                    <button onClick={() => handleCopy(c.value, c.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      {copied === c.id
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* CTA button */}
                <a href={c.href} target="_blank" rel="noopener noreferrer"
                  className={"mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 " + c.bg + " " + c.color}>
                  {c.type === "Telegram"
                    ? <><Send className="w-4 h-4" /> Buka Telegram</>
                    : c.label === "Saluran WhatsApp"
                    ? <><MessageCircle className="w-4 h-4" /> Follow Channel</>
                    : <><Phone className="w-4 h-4" /> Hubungi via WhatsApp</>}
                </a>
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="glass rounded-2xl border border-white/10 p-4 space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Info Penting</div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                Untuk masalah order/deposit, buat <strong className="text-foreground">tiket support</strong> di menu Bantuan agar lebih terstruktur
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                Follow saluran kami untuk mendapatkan <strong className="text-foreground">promo & diskon eksklusif</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                Jam aktif owner: <strong className="text-foreground">08.00 – 22.00 WIB</strong> setiap hari
              </li>
            </ul>
          </div>

        </div>
      </AppLayout>
    );
  }
  