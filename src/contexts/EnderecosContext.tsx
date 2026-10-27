import { createContext, type PropsWithChildren } from 'react';
import { useEnderecoStore } from '../hooks/useEnderecoStore';

export const EnderecosContext = createContext<ReturnType<typeof useEnderecoStore> | null>(null);

export function EnderecosProvider({ children }: PropsWithChildren) {
  const store = useEnderecoStore();
  return <EnderecosContext.Provider value={store}>{children}</EnderecosContext.Provider>;
}
