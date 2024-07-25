import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/petCurrency.sol/petCurrency.json";

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
  const [ownPet, setOwnedPet] = useState(false);


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

  const getPetBalance = async () => {
    if (atm) {
      const balanceInWei = await atm.getPetBalance();
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
  
  const getOwnedPet = async () => {
    if (atm) {
        const ownedPet = await atm.ownedPet();
        setOwnedPet(ownedPet);
    }
  }

  const petDeposit = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(amount.toString());
      let tx = await atm.petDeposit(amountInWei, { value: amountInWei });
      await tx.wait();
      getPetBalance();
    }
  };

  const petWithdraw = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(amount.toString());
      let tx = await atm.petWithdraw(amountInWei);
      await tx.wait();
      getPetBalance();
    }
  };

  const petTransfer = async () => {
    if (atm) {
      const amountInWei = ethers.utils.parseEther(transferAmount.toString());
      let tx = await atm.petTransfer(recipient, amountInWei);
      await tx.wait();
      getPetBalance();
    }
  };

  const buyPet = async () => {
    if (atm) {
      const petPriceInWei = ethers.BigNumber.from("1");

      try {
          const tx = await atm.buyPet();
          await tx.wait();
          getPetBalance();
          getOwnedPet();
          alert("Pet purchased successfully");
      } catch (error) {
          console.error("Error during pet purchase:", error);
          alert('Failed to buy pet.');
      }
    };
  }
  
  const sellPet = async () => {
    if (atm) {
      try {
        let tx = atm.sellPet();
        await tx.wait();
        getPetBalance();
        getOwnedPet();
        alert('Pet sold successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to sell pet.');
      }
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
      getPetBalance();
    }

    getOwnedPet();

    return (
      <div>
          <p><span style={{ fontWeight: 'bold', fontSize: '1.2rem'}}>Your Account: </span>{account}</p>
          <p><span style={{ fontWeight: 'bold', fontSize: '1.2rem'}}>Your Pet Balance: </span>{balance} ETH</p>
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
            onClick={petDeposit} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
            Deposit
          </button>
           &nbsp;
          <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer', }}
            onClick={petWithdraw} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }} >
            Withdraw
          </button>
        </div>
        <hr></hr>
        <p>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Pet Status: </span>
            {ownPet ? "You own a pet" : "You don't own a pet yet"}
        </p>
        <div style={{ marginTop: '5px', marginBottom: '10px'}}>
          <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer' }}
            onClick={buyPet} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }}>
            Buy Pet
          </button>
          &nbsp;
          <button style={{ backgroundColor: 'white', color: 'black', fontSize: '1.2rem', border: '1px solid black', padding: '8px 16px', cursor: 'pointer' }}
            onClick={sellPet} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = 'black'; }}>
            Sell Pet
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
            onClick={petTransfer} onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; e.target.style.color = 'white'; }}
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
        <h1>Welcome to the <br></br> Digital Petshop ATM!</h1>
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