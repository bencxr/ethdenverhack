import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet } from "viem/chains";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "./Main";
import KryptoKidsLanding from "./landingPage";
import { NFTGalleryPage } from "./.nftPage";
import { HODLJarListingsPage } from "./mainPage";
import FosterHomeManagement from "./foster";

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

const App = () => (
  <DynamicContextProvider
    theme="auto"
    settings={{
      environmentId: "4e81342b-d6e3-4c75-83aa-9e9ba53beee7",
      walletConnectors: [EthereumWalletConnectors],
    }}
  >
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DynamicWagmiConnector>
          <BrowserRouter>
            <Routes>
              <Route path="/dashboard" element={<Main />} />
              <Route path="/" element={<KryptoKidsLanding />} />
              <Route path="/nfts" element={<NFTGalleryPage />} />
              <Route path="main" element={<HODLJarListingsPage />} />
              <Route path="foster" element={<FosterHomeManagement />} />
            </Routes>
          </BrowserRouter>
        </DynamicWagmiConnector>
      </QueryClientProvider>
    </WagmiProvider>
  </DynamicContextProvider>
);

export default App;
