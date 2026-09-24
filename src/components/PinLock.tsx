import { useState, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export const PIN_KEY = 'allntic_pin_hash';

export async function hashPin(pin: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`allntic:${pin}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function PinLock({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem(PIN_KEY);
  const [unlocked, setUnlocked] = useState(!stored || sessionStorage.getItem('allntic_unlocked') === '1');
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = async () => {
    if ((await hashPin(pin)) === stored) {
      sessionStorage.setItem('allntic_unlocked', '1');
      setUnlocked(true);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs space-y-4 text-center">
        <BrandLogo className="h-28 w-28 mx-auto rounded-lg" />
        <div className="flex items-center justify-center gap-2"><Lock className="h-5 w-5 text-primary" /><h1 className="text-xl font-bold text-foreground">ALLNTIC GROUP</h1></div>
        <Input type="password" inputMode="numeric" autoFocus placeholder="Code PIN" value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()} className="text-center text-lg tracking-widest" />
        {error && <p className="text-sm text-destructive">Code incorrect</p>}
        <Button className="w-full" onClick={submit}>Déverrouiller</Button>
      </div>
    </div>
  );
}
