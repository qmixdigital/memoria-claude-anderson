'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RefreshPlatformButton } from './RefreshPlatformButton';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/carteira', label: '💼 Carteira' },
  { href: '/watchlist', label: '★ Watchlist' },
  { href: '/alertas', label: '🎯 Alertas' },
  { href: '/criptomoedas', label: '₿ Crypto' },
  { href: '/proventos', label: 'Proventos' },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fecha drawer ao mudar de rota
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Bloqueia scroll do body quando drawer aberto
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <nav
        style={{
          background: 'var(--bg)',
          backgroundImage: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-alt) 100%)',
          borderBottom: '1px solid var(--border-hex)',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          gap: '16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 8px 16px -8px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo-qmix-branca.webp"
            alt="QMIX Invest"
            width={120}
            height={26}
            priority
            style={{ height: '24px', width: 'auto', display: 'block' }}
          />
        </Link>

        {/* Desktop links — escondido em mobile */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                  color: active ? 'var(--primary-hex)' : 'var(--text-secondary)',
                  background: active ? 'var(--card)' : 'transparent',
                  border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile spacer */}
        <div className="nav-mobile-spacer" style={{ flex: 1 }} />

        {/* Refresh + version visíveis sempre, mas compactos em mobile */}
        <RefreshPlatformButton />
        <span
          className="nav-version"
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
            letterSpacing: '0.06em',
          }}
        >
          v0.7
        </span>

        {/* Hamburger — visível apenas em mobile */}
        <button
          type="button"
          aria-label={drawerOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="nav-hamburger"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-hex)',
            color: 'var(--foreground-hex)',
            borderRadius: '8px',
            width: '44px',
            height: '44px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            fontSize: '1.4rem',
            lineHeight: 1,
          }}
        >
          {drawerOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: '60px 0 0 0',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 99,
            backdropFilter: 'blur(4px)',
          }}
        >
          <nav
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-alt)',
              borderLeft: '1px solid var(--border-accent)',
              boxShadow: 'var(--shadow), var(--glow)',
              maxWidth: '320px',
              width: '85%',
              marginLeft: 'auto',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px 16px',
              gap: '4px',
              overflowY: 'auto',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-montserrat), Montserrat',
                marginBottom: '8px',
                paddingLeft: '6px',
              }}
            >
              Navegação
            </span>
            {links.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'var(--font-montserrat), Montserrat, sans-serif',
                    color: active ? 'var(--primary-hex)' : 'var(--foreground-hex)',
                    background: active ? 'var(--card)' : 'transparent',
                    border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Estilos responsivos da Nav */}
      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop-links { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-mobile-spacer { display: block; }
        }
        @media (min-width: 1025px) {
          .nav-mobile-spacer { display: none; }
          .nav-hamburger { display: none !important; }
        }
        @media (max-width: 480px) {
          .nav-version { display: none; }
        }
      `}</style>
    </>
  );
}
