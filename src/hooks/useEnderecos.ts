import { useContext } from "react";
import { EnderecosContext } from "../contexts/EnderecosContext";

export function useEnderecos() {
  const context = useContext(EnderecosContext);
  if (!context)
    throw new Error("useEnderecos deve ser usado dentro de EnderecosProvider.");
  return context;
}
