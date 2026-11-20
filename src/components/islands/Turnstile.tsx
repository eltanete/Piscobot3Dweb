import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Widget de Cloudflare Turnstile. Sin PUBLIC_TURNSTILE_SITE_KEY (desarrollo) no renderiza nada. */
export default function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    const montar = () => {
      if (ref.current && window.turnstile) {
        id = window.turnstile.render(ref.current, { sitekey: SITE_KEY, language: 'es' });
      }
    };
    if (window.turnstile) montar();
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (!s) {
        s = document.createElement('script');
        s.src = SRC;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener('load', montar);
    }
    return () => {
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  return SITE_KEY ? <div ref={ref} className="min-h-[65px]" /> : null;
}
