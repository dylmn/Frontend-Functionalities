import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState(1); 
  const [recipient, setRecipient] = useState(''); // new state for recipient address
  const [transferAmount, setTransferAmount] = useState(1); // default to 1 ETH for transfer
  const [lookupAddress, setLookupAddress] = useState(''); // state for address to lookup balance
  const [lookupResult, setLookupResult] = useState(undefined); // state for balance lookup result


  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getBalance();
      const balanceInEth = ethers.utils.formatEther(balanceInWei);
      setBalance(Math.floor(parseFloat(balanceInEth)));
    }
  };

  const lookUpBalance = async () => {
    if (atm && lookupAddress) {
      try {
        const balanceInWei = await atm.lookUpBalance(lookupAddress);
        const balanceInEth = ethers.utils.formatEther(balanceInWei);
        setLookupResult(Math.floor(parseFloat(balanceInEth)));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setLookupResult(undefined);
      }
    }
  };
  

  const deposit = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(amount.toString());
      let tx = await atm.deposit(amountInWei, { value: amountInWei });
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(amount.toString());
      let tx = await atm.withdraw(amountInWei);
      await tx.wait();
      getBalance();
    }
  };

  const transfer = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(transferAmount.toString());
      let tx = await atm.transfer(recipient, amountInWei);
      await tx.wait();
      getBalance();
    }
  };
  

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
          <p><span style={{ fontWeight: 'bold', fontSize: '1.2rem'}}>Your Account: </span>{account}</p>
          <p><span style={{ fontWeight: 'bold', fontSize: '1.2rem'}}>Your Balance: </span>{balance} ETH</p>
        <div>
          <label style={{fontWeight: 'bold', fontSize: '1.2rem'}}>
            Amount (ETH): &nbsp;
            <input style={{fontSize: '1.2rem'}}
              type="number"
              value={amount}
              min="1"
              onChange={(e) => setAmount(parseInt(e.target.value, 10))}
            />
          </label>
        </div>
        <div style={{ marginTop: '5px', marginBottom: '10px'}}>
          <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer', }}
            onClick={deposit} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
            Deposit
          </button>
           &nbsp;
          <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer', }}
            onClick={withdraw} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
            Withdraw
          </button>
        </div>
        <hr></hr>
        <div>
          <label style={{fontWeight: 'bold', fontSize: '1.2rem'}}>
            To (Address): &nbsp;
            <input style={{fontSize: '1.2rem'}}
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label style={{fontWeight: 'bold', fontSize: '1.2rem'}}> 
            Amount (ETH): &nbsp;
            <input style={{fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px'}}
              type="number"
              value={transferAmount}
              min="1"
              onChange={(e) => setTransferAmount(parseInt(e.target.value, 10))}
            />
          </label>
        </div>
        <div style={{ marginTop: '5px', marginBottom: '10px'}}>
        <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer', }}
            onClick={transfer} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
            Transfer
          </button>
        </div>
        <hr></hr>
        <div>
          <label style={{fontWeight: 'bold', fontSize: '1.2rem'}}> 
            Lookup Address Balance: &nbsp;
            <input style={{fontWeight: 'bold', fontSize: '1.2rem'}}
              type="text"
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
            />
          </label>
          <br></br>
          <div style={{ marginTop: '5px', marginBottom: '10px'}} >
            <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer', }}
              onClick={lookUpBalance} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
              Lookup Balance
            </button>
            {lookupResult !== undefined && (
              <p>Balance of {lookupAddress}: {lookupResult} ETH</p>
            )}
          </div>
          
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          font-family: 'Roboto', sans-serif;
          background-color: #f0f0f0;
          text-align: center;
          margin: auto;
          max-width: 600px;
          padding: 20px;
        }
        header {
          margin-bottom: 20px;
        }
        h1 {
          font-size: 2.5rem;
          color: #333;
        }
      `}</style>
    </main>
  );
}