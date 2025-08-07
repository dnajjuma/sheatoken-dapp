import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0x05d1918a7fe7b1db77c7eb85744c36a11bb5b20b';
const ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function burn(uint256 amount) public",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

export default function WalletCard() {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [symbol, setSymbol] = useState('SHEA');

  async function connectWallet() {
    if (!window.ethereum) return alert('Please install MetaMask');
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setWalletAddress(account);
    getTokenBalance(account);
  }

  async function getTokenBalance(account) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, provider);
    const [balanceRaw, tokenSymbol] = await Promise.all([
      contract.balanceOf(account),
      contract.symbol()
    ]);
    setSymbol(tokenSymbol);
    setBalance(ethers.formatUnits(balanceRaw, 18));
  }

  async function sendTokens() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);
    const tx = await contract.transfer(recipient, ethers.parseUnits(amount, 18));
    await tx.wait();
    getTokenBalance(walletAddress);
  }

  async function burnTokens() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, signer);
    const tx = await contract.burn(ethers.parseUnits(burnAmount, 18));
    await tx.wait();
    getTokenBalance(walletAddress);
  }

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl max-w-xl mx-auto mt-10 text-center space-y-4">
      <h1 className="text-2xl font-bold">SheaToken DApp</h1>
      <button onClick={connectWallet} className="bg-black text-white px-4 py-2 rounded-full">
        Connect Wallet
      </button>
      {walletAddress && <p>Connected: {walletAddress}</p>}
      {balance !== null && <p>Your Balance: {balance} {symbol}</p>}

      <div className="space-y-2 mt-4">
        <h2 className="font-semibold">Send Tokens</h2>
        <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient" className="border px-2 py-1 w-full" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="border px-2 py-1 w-full" />
        <button onClick={sendTokens} className="bg-blue-600 text-white px-4 py-2 rounded-full">Send</button>
      </div>

      <div className="space-y-2 mt-4">
        <h2 className="font-semibold">Burn Tokens</h2>
        <input value={burnAmount} onChange={e => setBurnAmount(e.target.value)} placeholder="Amount" className="border px-2 py-1 w-full" />
        <button onClick={burnTokens} className="bg-red-600 text-white px-4 py-2 rounded-full">Burn</button>
      </div>
    </div>
  );
}