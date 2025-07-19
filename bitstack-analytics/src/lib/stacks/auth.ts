import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const appDetails = {
  name: 'BitStack Analytics',
  icon:
    typeof window !== 'undefined'
      ? `${window.location.origin}/icons/bitcoin-icon.svg`
      : '',
};

export const connectOptions = {
  userSession,
  appDetails,
  onFinish: () => {
    window.location.reload();
  },
  onCancel: () => {
    console.log('User cancelled connection');
  },
};

export const getStacksNetwork = () => {
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

export const connectWallet = () => {
  showConnect(connectOptions);
};

export const disconnectWallet = () => {
  if (userSession.isUserSignedIn()) {
    userSession.signUserOut();
    window.location.reload();
  }
};

export const getUserData = () => {
  if (userSession.isUserSignedIn()) {
    return userSession.loadUserData();
  }
  return null;
};

export const getAddress = () => {
  const userData = getUserData();
  if (userData) {
    const network = getStacksNetwork();
    return userData.profile.stxAddress[
      network.version === 1 ? 'mainnet' : 'testnet'
    ];
  }
  return null;
};

export const isUserSignedIn = () => {
  return userSession.isUserSignedIn();
};
