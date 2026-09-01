"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
        return;
      }

      const accessCheck = await fetch("/api/admin/memories");
      if (!accessCheck.ok) {
        await supabase.auth.signOut();
        setError("Bu hesabın admin yetkisi yok.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="paper-card p-8 w-full max-w-sm">
        <h1 className="font-display text-4xl text-terracotta text-center mb-2">
          Admin
        </h1>
        <p className="font-body text-sm text-warm-brown/60 text-center mb-8">
          Necati & Tuğçe Anı Albümü
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-warm-brown/70 mb-1.5">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-off-white border border-terracotta/15 text-warm-brown focus:border-dusty-pink transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-warm-brown/70 mb-1.5">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-off-white border border-terracotta/15 text-warm-brown focus:border-dusty-pink transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-terracotta text-center">{error}</p>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </div>
    </main>
  );
}
