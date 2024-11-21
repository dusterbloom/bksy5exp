const CHAIN_ID = 'cosmoshub-4';
const CHAIN_NAME = 'Cosmos Hub';

export const connectKeplr = async () => {
  try {
    // Check if Keplr is installed
    if (!window.keplr) {
      throw new Error('Please install Keplr extension');
    }

    // Enable the chain
    await window.keplr.enable(CHAIN_ID);

    // Get the offlineSigner
    const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID);

    // Get user's address
    const accounts = await offlineSigner.getAccounts();
    const address = accounts[0].address;

    return {
      success: true,
      data: {
        address,
        signer: offlineSigner
      }
    };
  } catch (error) {
    console.error('Keplr connection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getKeplrAccount = async () => {
  try {
    if (!window.keplr) {
      throw new Error('Keplr not found');
    }

    const key = await window.keplr.getKey(CHAIN_ID);
    return {
      success: true,
      data: {
        address: key.bech32Address,
        pubKey: key.pubKey,
        name: key.name
      }
    };
  } catch (error) {
    console.error('Get account error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const suggestChain = async () => {
  try {
    await window.keplr.experimentalSuggestChain({
      chainId: CHAIN_ID,
      chainName: CHAIN_NAME,
      rpc: 'https://rpc-cosmoshub.keplr.app',
      rest: 'https://lcd-cosmoshub.keplr.app',
      bip44: {
        coinType: 118,
      },
      bech32Config: {
        bech32PrefixAccAddr: 'cosmos',
        bech32PrefixAccPub: 'cosmospub',
        bech32PrefixValAddr: 'cosmosvaloper',
        bech32PrefixValPub: 'cosmosvaloperpub',
        bech32PrefixConsAddr: 'cosmosvalcons',
        bech32PrefixConsPub: 'cosmosvalconspub'
      },
      currencies: [{
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos'
      }],
      feeCurrencies: [{
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos'
      }],
      stakeCurrency: {
        coinDenom: 'ATOM',
        coinMinimalDenom: 'uatom',
        coinDecimals: 6,
        coinGeckoId: 'cosmos'
      },
      gasPriceStep: {
        low: 0.01,
        average: 0.025,
        high: 0.04
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Suggest chain error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
