import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [randomNumber, setRandomNumber] = useState(undefined);
  const [treasureName, setTreasureName] = useState(undefined);
  const [depositCount, setDepositCount] = useState(undefined);
  const [withdrawalCount, setWithdrawalCount] = useState(undefined);
  const [userLevel, setUserLevel] = useState(undefined);


  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;
  
  const getUserLevel = async() => {
    if (atm) {
      const userLevel = await atm.getUserLevel();
      setUserLevel(userLevel);
    }
  }

  const generateRandomNumber = async() => {
    if (atm) {
      let tx = await atm.generateRandomNumber();
      await tx.wait();
      getGeneratedRandomNumber();
    }
  }

  const getGeneratedRandomNumber = async() => {
    if (atm) {
      const randomNumber = await atm.randomNumber();
      setRandomNumber(randomNumber.toNumber());
    }
  }

  const generateTreasureName = async() => {
    if (atm) {
      const treasureName = await atm.generateTreasureName();
      setTreasureName(treasureName);
    }
  }

  const getTransactionCount = async() => {
    if (atm) {
      const [depositCount, withdrawalCount] = await atm.getTransactionCount();
      setDepositCount(depositCount.toNumber());
      setWithdrawalCount(withdrawalCount.toNumber());
    }
  }

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({method: "eth_accounts"});
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log ("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const getBalance = async() => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async() => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async() => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    generateTreasureName();
    getTransactionCount();
    getUserLevel();

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Deposits: {depositCount}</p>
        <p>Withdrawals: {withdrawalCount}</p>
        <p>User Level: {userLevel}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={generateRandomNumber}>Generate Lucky Number</button>
        <p>Lucky Number: {randomNumber}</p>
        <p>Treasure Location: {treasureName}</p>
      </div>
    )
  }

  useEffect(() => {getWallet();}, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
