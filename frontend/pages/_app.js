import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import AppShell from "../components/AppShell";
import { ProfileProvider, useProfile } from "../context/ProfileContext";
import { ToastProvider } from "../context/ToastContext";
import { NAV_ITEMS } from "../lib/constants";
import "../styles/globals.css";

function RoleGuard({ children }) {
  const router = useRouter();
  const { profil, pret } = useProfile();
  const pathname = router.pathname;

  useEffect(() => {
    if (!pret || !router.isReady) return;
    const match = NAV_ITEMS.find((item) => {
      if (item.exact) return pathname === item.href;
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
    if (match && !match.roles.includes(profil) && pathname !== "/") {
      router.replace("/");
    }
  }, [profil, pret, pathname, router.isReady, router]);

  return children;
}

export default function App({ Component, pageProps }) {
  return (
    <ProfileProvider>
      <ToastProvider>
        <Head>
          <title>PetroStock SA</title>
        </Head>
        <AppShell>
          <RoleGuard>
            <Component {...pageProps} />
          </RoleGuard>
        </AppShell>
      </ToastProvider>
    </ProfileProvider>
  );
}
