import { createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { celoAlfajores } from 'wagmi/chains';

export function getConfig() {
  return createConfig({
    chains: [celoAlfajores],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [celoAlfajores.id]: http(),
    },
  });
}
