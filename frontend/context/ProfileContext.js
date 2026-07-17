import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ROLE_OPTIONS, ROLES } from "../lib/constants";

const ProfileContext = createContext(null);
const STORAGE_KEY = "petrostock-profile";

export function ProfileProvider({ children }) {
  const [profil, setProfil] = useState(ROLES.achats);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ROLE_OPTIONS.some((o) => o.value === saved)) {
      setProfil(saved);
    }
    setPret(true);
  }, []);

  useEffect(() => {
    if (!pret) return;
    localStorage.setItem(STORAGE_KEY, profil);
  }, [profil, pret]);

  const value = useMemo(
    () => ({
      profil,
      setProfil,
      pret,
      label: ROLE_OPTIONS.find((o) => o.value === profil)?.label || profil,
      isDepot: profil === ROLES.depot,
      isAchats: profil === ROLES.achats,
      isDirection: profil === ROLES.direction,
    }),
    [profil, pret]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile doit être utilisé dans ProfileProvider");
  return ctx;
}
