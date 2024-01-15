import { useState, useEffect, Fragment } from 'react';
import { ethers } from "ethers";
import { useWeb3React } from '@web3-react/core';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import PRESALE_ABI from "../../../contracts/presale.json";
import ERC20_ABI from "../../../contracts/ERC20_abi.json";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment'; 
import Alert from '../../ui/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import moment from 'moment';
import { netlist } from '../../../components/account/WalletConnector'

// For testnet
// const PresaleContractAddress = [
//   "0xe819F73a499893EeF48b568BdDbDe7505932F7fF",
//   "0xF3e95D668fe935ED64dDf38dA8bA1082b983D4aD"
// ];

// const USDTContractAddress = [
//   "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
//   "0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814"
// ];

// For mainnet
const PresaleContractAddress = [
  "0xdfa8a0c23a502560ce711af1ded457f5c9d0fdfd",
  "0x4b36c52840d064749c83ce48e2b170d380790450"
];

const USDTContractAddress = [
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "0x55d398326f99059fF775485246999027B3197955"
];

let chainindex = 0; 

const netChainId = [
  0x1,  //Eth mainnet
  0x38  //BSC mainnet
];

// const netChainId = [
//   0x5,  // Goerli Testnet
//   0x61  // BSC testnet
// ];

const CardLabel = ({text}) => {
  return (<Typography 
    color="text.secondary" 
    sx={{ fontWeight: 500}}
    variant="body1" 
    display="block" 
  >
    {text}
  </Typography>)
}

const CardValue = ({text}) => {
  return (
    <Typography 
      color="text.primary"
      sx={{ fontWeight: 500, textAlign: "right"}}
    >
      {text}
    </Typography>
  )
}

const Opened = () => {
  const [amountToBuy, setAmountToBuy] = useState(1);
  const [tokenInfo, setTokenInfo] = useState([])
  const [presaleInfo, setPresaleInfo] = useState([])
  const [buyerInfo, setBuyerInfo] = useState([])
  const [status, setStatus] = useState([])
  const [presaleState, setPresaleState] = useState(0);
  const [alertMsg, setAlertMsg] = useState('');
  const [openAlert, setOpenAlert] = useState(false);

  const {account, library} = useWeb3React();

  useEffect(() => {
    if(!library) {
      Init()
      return;
    }

    if(!library.provider) {
      Init()
      return
    }

    //console.log(parseInt(library.provider.chainId), "net chain id");
    if(parseInt(library.provider.chainId) === netChainId[0]) {
      chainindex = 0
      getInfo()
    } else if(parseInt(library.provider.chainId) === netChainId[1]) {
      chainindex = 1
      getInfo()
    } else {
      setOpenAlert(true)
      setAlertMsg('Selected chain is unrecognized')
    }   

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, library])

  const Init = () => {
    setAmountToBuy(1)
    setTokenInfo([])
    setPresaleInfo([])
    setStatus([])
    setBuyerInfo([])
    setPresaleState('')
  }

  const getContract = (abi, address, signer = null) => {
    const signerOrProvider = signer
    return new ethers.Contract(address, abi, signerOrProvider)
  }

  const getInfo = async () => {

    let presalecontract;

    if(!account) {
      setOpenAlert(true)
      setAlertMsg('Wallet is unconnected')
      return null;
    }

    const signer = await library.getSigner();

    presalecontract = getContract(PRESALE_ABI, PresaleContractAddress[chainindex], signer)
   
    let chainSuffix = ""
    if(parseInt(library.provider.chainId) === netChainId[0]) {
      chainSuffix = "ETH"
    } else {
      chainSuffix = "BNB"
    }

    let presaleinfo;
    let presale_start;
    let presale_end;
    let maxTokensToBuy;
    let currentSupply;
    let currentStep;
    let token_rate;
    let _stage_start;
    let _stage_end;

    try {
      const prices = await presalecontract.roundDetails(1);
      const stages = await presalecontract.roundDetails(2);
      const supply = await presalecontract.roundDetails(0);
      currentStep = await presalecontract.currentStep();
      currentStep = parseInt(currentStep, 16);
      currentSupply = currentStep == 0 ? supply[0] : supply[currentStep] - supply[currentStep-1];

      presale_start = await presalecontract.startTime();
      presale_end = await presalecontract.endTime();
      maxTokensToBuy = await presalecontract.maxTokensToBuy();

      token_rate = prices[currentStep] / 10e17;
      console.log(token_rate)
      _stage_start = currentStep == 0 ? presale_start :stages[currentStep - 1]
      _stage_end = stages[currentStep]

    } catch (error) {
      console.log(error)
      setOpenAlert(true)
      setAlertMsg('Get Presale Information Error')
      return null;
    }

    const soft_starttime = `${moment.utc(parseInt(presale_start)*1000).format('Do of MMM, h A')} UTC`
    const soft_endtime = `${moment.utc(parseInt(presale_end)*1000).format('Do of MMM, h A')} UTC`

    const stage_start = `${moment.utc(parseInt(_stage_start)*1000).format('Do of MMM, h A')} UTC`
    const stage_end = `${moment.utc(parseInt(_stage_end)*1000).format('Do of MMM, h A')} UTC`

    setPresaleInfo([
      {id: "Stage: ", val: "Stage " + (currentStep + 1)},
      {id: "Stage Start:", val: stage_start},
      {id: "Stage End:", val:  stage_end},
      {id: "Token Rate:", val: token_rate + " $" },
      {id: "Buy max:", val: maxTokensToBuy.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") + " " + "TBD"},
      {id: "Presale Start:", val: soft_starttime},
      {id: "Presale End:", val: soft_endtime},
    ])
    
    setTokenInfo([
      {id:"Token Name:", val: "Trump v Biden"},
      {id:"Token Symbol:", val: "TBD"},
      {id:"Token Decimal:", val: 18},
      {id:"Sale Supply:", val: parseInt(currentSupply).toLocaleString()},
    ])
    
    let raised_amount, remainedForBSC, remainedForEth;
    try {
      raised_amount = await presalecontract.usdRaised();
      const ethProvider = new ethers.providers.JsonRpcProvider(netlist[0]['rpcurl']);
      const bscProvider = new ethers.providers.JsonRpcProvider(netlist[1]['rpcurl']);
      const ethPresale = getContract(PRESALE_ABI, PresaleContractAddress[0], ethProvider)
      const bscPresale = getContract(PRESALE_ABI, PresaleContractAddress[1], bscProvider)
      remainedForEth = await ethPresale.totalTokensSold();
      remainedForBSC = await bscPresale.totalTokensSold();

    } catch (error) {
      console.log(error)
      setOpenAlert(true)
      setAlertMsg('Get Status Information Error')
      return null;
    }

    setStatus([
      {id: "Raised Amount", val: ethers.utils.formatUnits(raised_amount, 18).toString() + " $" },
      { id: "Remained TBD", val: (parseInt(currentSupply) - (parseInt(remainedForEth) + parseInt(remainedForBSC))).toLocaleString() + " " + "TBD" },

    ])
  
    try{
        const buyAmount = await presalecontract.userDeposits(account);
        setBuyerInfo(
          [
            { id: "Invested", val: ethers.utils.formatUnits(buyAmount, 18).toString() + " " + "TBD" },
          ]
        )
    }
    catch (error)
    {
      setOpenAlert(true)
      setAlertMsg('Get Buyers Information Error')
      return null;
    }
    
    const state = await getPresaleStatus(presalecontract);
    setPresaleState(parseInt(state));
  }
  
  const getPresaleStatus = async (presalecontract) => {

    let state;
    try {
      let blockTime = await presalecontract.getBlockTime(); blockTime = parseInt(blockTime);
      let startTime = await presalecontract.startTime(); startTime = parseInt(startTime);
      let endTime = await presalecontract.endTime(); endTime = parseInt(endTime);

      if (blockTime > startTime && blockTime < endTime) {
        state = 1;
      } else if (blockTime > endTime){
        state = 2;
      } else {
        state = 4; // Not active.
      }
    } catch (error) {
      console.log(error)
      setOpenAlert(true)
      setAlertMsg('Get Status Error')
      return null;
    }

    return state
  }

  const Deposit = async (amount, type) => {

    let presalecontract;
    if(!account) {
      setOpenAlert(true)
      setAlertMsg('Wallet is unconnected')
      return null;
    }

    const signer = await library.getSigner();
    presalecontract = getContract(PRESALE_ABI, PresaleContractAddress[chainindex], signer)
    if(
      parseInt(library.provider.chainId) !== netChainId[0]
      && parseInt(library.provider.chainId) !== netChainId[1]
    ) {  
      setOpenAlert(true)
      setAlertMsg('Selected chain is unrecognized')
      return
    }

    if ((!amount || amount <= 0)) {
      setOpenAlert(true)
      setAlertMsg('Please enter a valid amount')
      return
    }

    let overrid = parseInt(amount);

    try {

      let tx;
      if (type == 0) {
        const payEth =  await presalecontract.ethBuyHelper(overrid);
        tx = await presalecontract.buyWithEth(overrid, { value: payEth })
      } else {
        // const USDT =  await presalecontract.usdtBuyHelper(overrid);
        const usdcontract = getContract(ERC20_ABI, USDTContractAddress[chainindex], signer)
        const usdBalance = await usdcontract.balanceOf(account);
        let allowance = await usdcontract.allowance(account, PresaleContractAddress[chainindex]);
        if (allowance < usdBalance) {
          await usdcontract.approve(
            PresaleContractAddress[chainindex],
            ethers.BigNumber.from(
              usdBalance
            )
          );
        }

        tx = await presalecontract.buyWithUSDT(overrid)
      }
      let receipt = await tx.wait();
      console.log("Transaction hash is ", tx.hash);
      console.log(receipt)
      setOpenAlert(true)
      setAlertMsg('Buy done successfully')
    } catch (error) {
      console.log(error)
      setOpenAlert(true)
      setAlertMsg('Buy failed')
      return;
    }
  }

  const Claim = async () => {

    let presalecontract;
    if(!account) {
      setOpenAlert(true)
      setAlertMsg('Wallet is unconnected')
      return null;
    }

    const signer = await library.getSigner();
    presalecontract = getContract(PRESALE_ABI, PresaleContractAddress[chainindex], signer)
    if(
      parseInt(library.provider.chainId) !== netChainId[0] 
      && parseInt(library.provider.chainId) !== netChainId[1]
    ) {
      setOpenAlert(true)
      setAlertMsg('Selected chain is unrecognized')
      return
    }

    try {
      const tx = await presalecontract.claim()
      let receipt = await tx.wait();
      console.log("Transaction hash is ", tx.hash);
      console.log(receipt)

      setOpenAlert(true)
      setAlertMsg('Claim done successfully')
    } catch (error) {
      setOpenAlert(true)
      setAlertMsg('Claim failed')
      return;
    }
  }

  const getStatusString = () => {
    let label;
    switch(presaleState) {
      case 1:
        label = 'Sale is Active'
        break;
      case 2:
        label = 'Sale is Successful'
        break;
      case 3:
        label = 'Sale is failed'
        break;
      default:
        label = 'Sale is not Active'
    }

    return label;
  }

  const actionEth = () => {
    let label;
    const network = handleSelectedChain();
    switch(presaleState) {
      case 1:
        label = network
        break;
      case 2:
        label = 'Claim'
        break;
      default:
        return null
    }

    const execFunc = async () => {
      switch(presaleState) {
        case 1:
          label = network
          Deposit(amountToBuy, 0)
          break;
        case 2:
          label = 'Claim'
          Claim();
          break;
        default:
          return null
      }
    }

    return (
      <Button
        fullWidth
        onClick={
          () => execFunc()
        }
        >
        {label}
      </Button>
    )
  }

  const actionUsd = () => {
    let label;
    switch(presaleState) {
      case 1:
        label = '$USDT'
        break;
      case 2:
        label = 'Claim'
        break;
      default:
        return null
    }

    const execFunc = async () => {
      switch(presaleState) {
        case 1:
          label = '$USDT'
          Deposit(amountToBuy, 1)
          break;
        case 2:
          label = 'Claim'
          Claim();
          break;
        default:
          return null
      }
    }

    return (
      <Button
        fullWidth
        onClick={
          () => execFunc()
        }
        >
        {label}
      </Button>
    )
  }



  const handleStateChipColor = (state) => {
    switch(state) {
      case 1:
      case 2:
        return 'success'
      case 3:
        return 'error'
      default:
        return 'default'
    }
  }

  const handleSelectedChain = () => {
    try {
      switch(parseInt(library.provider.chainId)) {
        case netChainId[1]:
          return '$BNB'
        case netChainId[0]:
          return '$ETH'
        default:
          return 'Unknown'
      }
    } catch(e) {
      return 'Unrecognized chain'
    }
  }

  return (
    <Fragment>
      <Alert
        openAlert={openAlert}
        setOpenAlert={setOpenAlert}
        msg={alertMsg}
      />
      {presaleState === 1 && (
              <Typography 
              color="text.primary"
              sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
              variant="h6"
            >
              Pre-sale is started.
          </Typography>
      )}
      {presaleState === 2 && (
              <Typography 
              color="text.primary"
              sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
              variant="h6"
            >
              Pre-sale is finished with successful.
          </Typography>
      )}
       {presaleState === 3 && (
              <Typography 
              color="text.primary"
              sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}
              variant="h6"
            >
              Pre-sale is finished with failure.
          </Typography>
      )}

      <Grid container spacing={2} justifyContent="center" className="fadeInUp">
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0} 
            sx={{
              borderRadius: 10, 
              p: 1,
              boxShadow: '0 2px 16px rgb(53 69 89 / 5%)'
            }}
          > 
            <CardContent>
              <Divider light textAlign="left"><Chip label="Token Information" /></Divider>
              {tokenInfo.map((item, i) => (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} key={i}>
                  <CardLabel text={item.id} />
                  <CardValue text={item.val} />
                </Stack>
              ))}
              <Divider light textAlign="left" sx={{mt: 3}}><Chip label="Pre-sale Information" /></Divider>
              {presaleInfo.map((item, i) => (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} key={i}>
                  <CardLabel text={item.id} />
                  <CardValue text={item.val} />
                </Stack>
              ))}
              <Divider light textAlign="left" sx={{mt: 3}}><Chip label="Pre-sale Status" /></Divider>
              {status.map((item, i) => (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} key={i}>
                  <CardLabel text={item.id} />
                  <CardValue text={item.val} />
                </Stack>
              ))}
               <Divider light textAlign="left" sx={{mt: 3}}><Chip label="Buyer Information" /></Divider>
              {buyerInfo.map((item, i) => (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} key={i}>
                  <CardLabel text={item.id} />
                  <CardValue text={item.val} />
                </Stack>
              ))}
              {presaleState && (
                (<Stack direction="row" justifyContent="flex-end">
                  <Chip
                    label={getStatusString()} 
                    color={handleStateChipColor(presaleState)} 
                    sx={{letterSpacing: 1, fontWeight: 500, mt: 2}}
                  />
                </Stack>)
              )}
              {presaleState === 1 && (
                <Fragment>
                  <Typography variant='caption' display="block" sx={{fontWeight: 700, mb: 1}}>Buy TBD Token</Typography>
                  <TextField
                    type="number"
                    id="amountToBuy"
                    label="Amount to Buy"
                    variant="standard"
                    value={amountToBuy}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setAmountToBuy(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{"$TBD"}</InputAdornment>,
                      autoComplete: "off"
                    }}
                    fullWidth
                    sx={{mb: 1}}
                  />
                </Fragment>
              )}
            </CardContent>
            <CardActions>
              {actionEth()}
              {actionUsd()}
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
}
 
export default Opened;
