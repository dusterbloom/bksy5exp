import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectKeplr, getKeplrAccount, suggestChain } from '../services/wallet';
import { Link } from 'react-router-dom';

function Functions() {
  const { session } = useAuth();
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [walletStatus, setWalletStatus] = useState({
    connected: false,
    address: null,
    error: null
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (copyStatus) {
      const timer = setTimeout(() => setCopyStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);

  const checkWalletConnection = async () => {
    const account = await getKeplrAccount();
    if (account.success) {
      setWalletStatus({
        connected: true,
        address: account.data.address,
        error: null
      });
    }
  };

  const functions = [
    { 
      tag: '#pay', 
      description: 'Send payments', 
      color: '#22c55e',
      contract: 'cosmos1abc...def',
      example: '#pay $100 @bob #90days',
      settingsPath: '/settings/pay'
    },
    { 
      tag: '#swap', 
      description: 'Swap assets', 
      color: '#3b82f6',
      contract: 'cosmos2def...abc',
      example: '#swap 50ATOM to OSMO @alice',
      settingsPath: '/settings/swap'
    },
    { 
      tag: '#lend', 
      description: 'Lend assets', 
      color: '#f59e0b',
      contract: 'cosmos3ghi...jkl',
      example: '#lend 1000USDC @carol #5%APY',
      settingsPath: '/settings/lend'
    },
    { 
      tag: '#invest', 
      description: 'Invest in assets', 
      color: '#8b5cf6',
      contract: 'cosmos4mno...pqr',
      example: '#invest $500 @dao #6months',
      settingsPath: '/settings/invest'
    },
    { 
      tag: '#node', 
      description: 'Create Cycles Node', 
      color: '#ec4899',
      contract: 'cosmos5stu...vwx',
      example: '#node create @mynode #validator',
      settingsPath: '/settings/node'
    }
  ];

  const handleConnectWallet = async () => {
    try {
      await suggestChain();
      const result = await connectKeplr();
      
      if (result.success) {
        setWalletStatus({
          connected: true,
          address: result.data.address,
          error: null
        });
      } else {
        setWalletStatus(prev => ({
          ...prev,
          error: result.error
        }));
      }
    } catch (error) {
      setWalletStatus(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const handleFunctionClick = (func) => {
    if (!walletStatus.connected) {
      handleConnectWallet();
      return;
    }
    setSelectedFunction(func);
  };

  const copyExample = async (example, e) => {
    e.stopPropagation();
    const textArea = document.createElement('textarea');
    textArea.value = example;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopyStatus(`Copied: ${example}`);
    } catch (err) {
      console.error('Copy failed:', err);
      setCopyStatus('Failed to copy - please copy manually');
    }
    
    textArea.remove();
  };

  return (
    <div className="container">
      <div className="functions-header">
        <h2>Financial Functions</h2>
        <p className="functions-subtitle">Quick access to financial operations</p>
        {walletStatus.connected ? (
          <div className="wallet-status success">
            Connected: {walletStatus.address.slice(0, 8)}...{walletStatus.address.slice(-6)}
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleConnectWallet}>
            Connect Keplr Wallet
          </button>
        )}
        {walletStatus.error && (
          <div className="error">{walletStatus.error}</div>
        )}
      </div>

      <div className="functions-grid">
        {functions.map((func) => (
          <div
            key={func.tag}
            className="function-card"
            style={{ '--function-color': func.color }}
          >
            <div className="function-header">
              <div className="function-tag">{func.tag}</div>
              <Link 
                to={func.settingsPath} 
                className="function-settings"
                onClick={(e) => e.stopPropagation()}
              >
                ⚙️
              </Link>
            </div>
            <div className="function-description">{func.description}</div>
            <div className="function-contract">
              Contract: <span className="monospace">{func.contract}</span>
            </div>
            <div 
              className="function-example"
              onClick={(e) => copyExample(func.example, e)}
            >
              <span className="example-label">Example (click to copy):</span>
              <code>{func.example}</code>
            </div>
            <button 
              className="btn btn-secondary function-action"
              onClick={() => handleFunctionClick(func)}
            >
              Use {func.tag}
            </button>
          </div>
        ))}
      </div>

      {copyStatus && (
        <div className="copy-notification">
          {copyStatus}
        </div>
      )}

      {selectedFunction && (
        <div className="function-modal">
          <div className="modal-header">
            <h3>{selectedFunction.tag}</h3>
            <button 
              className="modal-close"
              onClick={() => setSelectedFunction(null)}
            >
              ×
            </button>
          </div>
          <div className="modal-content">
            <p>Contract Address: {selectedFunction.contract}</p>
            <p>Example Usage: {selectedFunction.example}</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={(e) => copyExample(selectedFunction.example, e)}
              >
                Copy Example
              </button>
              <Link 
                to={selectedFunction.settingsPath}
                className="btn btn-primary"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Functions;
