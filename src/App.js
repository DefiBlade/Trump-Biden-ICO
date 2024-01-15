import { useEffect } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { useWeb3React } from '@web3-react/core';
import ERC20Balance from "components/ERC20Balance";
import Home from "containers/home";
import About from "containers/about";
import Gallery from "containers/gallery";
import Transactions from "containers/transactions";
import NFTs from "containers/nfts";
import "antd/dist/antd.css";
import Ramper from "./components/Ramper";
import Footer from './components/layout/Footer';
import MainNavigation from "components/layout/Header/MainNavigation";
import Swap from "containers/swap";
import Presale from "containers/pre-sale";
import Mint from "containers/mint";
import Stake from "containers/stake";

const App = () => {
  const { library, account } = useWeb3React()
    useEffect(() => {
      if(library) {
        localStorage.setItem("connected", true)
      }
    }, [library, account]);

  return (
    <BrowserRouter>
      <MainNavigation />
      <main style={{marginTop: 90, marginBottom: 90}}>
        <Switch>
          <Route exact path="/" component={Presale} /> 
          <Route exact path="/pre-sale" component={Presale} />
          <Route exact path="/nonauthenticated">
            <>Please login using the "Authenticate" button</>
          </Route>
        </Switch>
      </main>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
