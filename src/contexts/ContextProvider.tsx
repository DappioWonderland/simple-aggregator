import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider as ReactUIWalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
  // LedgerWalletAdapter,
  // SlopeWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { Cluster, clusterApiUrl, ConnectionConfig } from "@solana/web3.js";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { AutoConnectProvider, useAutoConnect } from "./AutoConnectProvider";
import { notify } from "../utils/notifications";
import {
  NetworkConfigurationProvider,
  useNetworkConfiguration,
} from "./NetworkConfigurationProvider";
import { FarmsProvider } from "./FarmsProvider";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;
  // const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const endpoint = "https://rpc-mainnet-fork.epochs.studio";
  // const endpoint = "https://ssc-dao.genesysgo.net";
  const config: ConnectionConfig = {
    wsEndpoint: "wss://rpc-mainnet-fork.epochs.studio/ws",
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 300 * 1000,
  };

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
      new TorusWalletAdapter(),
      // new LedgerWalletAdapter(),
      // new SlopeWalletAdapter(),
    ],
    [network]
  );

  const onError = useCallback((error: WalletError) => {
    notify({
      type: "error",
      message: error.message ? `${error.name}: ${error.message}` : error.name,
    });
    console.error(error);
  }, []);

  return (
    // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
    <ConnectionProvider endpoint={endpoint} config={config}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <NetworkConfigurationProvider>
        <AutoConnectProvider>
          <WalletContextProvider>
            <FarmsProvider>{children}</FarmsProvider>
          </WalletContextProvider>
        </AutoConnectProvider>
      </NetworkConfigurationProvider>
    </>
  );
};