// Load environment variables from .env file
require('dotenv').config();

// Import prompts for user input
const prompts = require('prompts');

// Import Solana handler
const { displaySolanaWalletInfo } = require('./solana-handler');

// Import database functions
const { saveEvmQuery, saveSolanaQuery } = require('../database/db');

// Import voice narration
const { narrate } = require('../voice/narrator');

// Get API key from environment variables
const apiKey = process.env.ALCHEMY_API_KEY;

// Validate that API key is set
if (!apiKey) {
  console.error("Error: ALCHEMY_API_KEY not found in environment variables");
  console.error("Please create a .env file in the root directory with your API key");
  process.exit(1);
}

// Define supported chains (EVM and Solana)
const SUPPORTED_CHAINS = [
  { title: 'Ethereum Mainnet', value: 'ETH_MAINNET_RPC', description: 'Ethereum Layer 1', type: 'evm' },
  { title: 'Ethereum Sepolia', value: 'ETH_SEPOLIA_RPC', description: 'Ethereum Testnet', type: 'evm' },
  { title: 'Ethereum Holesky', value: 'ETH_HOLESKY_RPC', description: 'Ethereum Testnet', type: 'evm' },
  { title: 'Polygon Mainnet', value: 'POLYGON_MAINNET_RPC', description: 'Polygon PoS', type: 'evm' },
  { title: 'Polygon Amoy', value: 'POLYGON_AMOY_RPC', description: 'Polygon Testnet', type: 'evm' },
  { title: 'Arbitrum One', value: 'ARB_MAINNET_RPC', description: 'Arbitrum L2', type: 'evm' },
  { title: 'Arbitrum Sepolia', value: 'ARB_SEPOLIA_RPC', description: 'Arbitrum Testnet', type: 'evm' },
  { title: 'Optimism Mainnet', value: 'OPT_MAINNET_RPC', description: 'Optimism L2', type: 'evm' },
  { title: 'Optimism Sepolia', value: 'OPT_SEPOLIA_RPC', description: 'Optimism Testnet', type: 'evm' },
  { title: 'Base Mainnet', value: 'BASE_MAINNET_RPC', description: 'Base L2', type: 'evm' },
  { title: 'Base Sepolia', value: 'BASE_SEPOLIA_RPC', description: 'Base Testnet', type: 'evm' },
  { title: 'zkSync Era', value: 'ZKSYNC_MAINNET_RPC', description: 'zkSync L2', type: 'evm' },
  { title: 'zkSync Sepolia', value: 'ZKSYNC_SEPOLIA_RPC', description: 'zkSync Testnet', type: 'evm' },
  { title: 'Blast Mainnet', value: 'BLAST_MAINNET_RPC', description: 'Blast L2', type: 'evm' },
  { title: 'Blast Sepolia', value: 'BLAST_SEPOLIA_RPC', description: 'Blast Testnet', type: 'evm' },
  { title: 'Astar zkEVM', value: 'ASTAR_ZKEVM_MAINNET_RPC', description: 'Astar zkEVM', type: 'evm' },
  { title: 'Zetachain Mainnet', value: 'ZETACHAIN_MAINNET_RPC', description: 'Zetachain', type: 'evm' },
  { title: 'Zetachain Testnet', value: 'ZETACHAIN_TESTNET_RPC', description: 'Zetachain Testnet', type: 'evm' },
  { title: 'Solana Mainnet', value: 'SOL_MAINNET_RPC', description: 'Solana Mainnet', type: 'solana' },
  { title: 'Solana Devnet', value: 'SOL_DEVNET_RPC', description: 'Solana Devnet', type: 'solana' }
];

// Define the asynchronous function that will retrieve deployed contracts
async function findContractsDeployed(address, baseURL) {
  const transfers = [];
  let pageKey = undefined;

  // Paginate through the results using alchemy_getAssetTransfers method
  do {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromBlock: "0x0",
        toBlock: "latest", // Fetch results up to the latest block
        fromAddress: address, // Filter results to only include transfers from the specified address
        excludeZeroValue: false, // Include transfers with a value of 0
        category: ["external"], // Filter results to only include external transfers
        ...(pageKey && { pageKey }) // Add pageKey if it exists
      }]
    };

    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error:", data.error);
      break;
    }

    transfers.push(...data.result.transfers);
    pageKey = data.result.pageKey;
  } while (pageKey);

  // Filter the transfers to only include contract deployments (where 'to' is null)
  const deployments = transfers.filter((transfer) => transfer.to === null);
  const txHashes = deployments.map((deployment) => deployment.hash);

  // Fetch the transaction receipts for each of the deployment transactions
  const promises = txHashes.map(async (hash) => {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getTransactionReceipt",
      params: [hash]
    };

    const response = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    return data.result;
  });

  // Wait for all the transaction receipts to be fetched
  const receipts = await Promise.all(promises);
  const contractAddresses = receipts.map((receipt) => receipt?.contractAddress).filter(Boolean);
  return contractAddresses;
}

// Define the main function that will execute the script
async function main() {
  // Prompt user for blockchain selection
  const chainResponse = await prompts({
    type: 'select',
    name: 'chain',
    message: 'Select the blockchain to query:',
    choices: SUPPORTED_CHAINS,
    initial: 0
  });

  // Exit if user cancels the prompt
  if (!chainResponse.chain) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  // Get the RPC URL from environment variables
  const rpcUrl = process.env[chainResponse.chain];

  if (!rpcUrl) {
    console.error(`Error: ${chainResponse.chain} not found in environment variables`);
    console.error('Please check your .env file');
    process.exit(1);
  }

  // Get selected chain details
  const selectedChain = SUPPORTED_CHAINS.find(c => c.value === chainResponse.chain);

  // Determine validation and message based on chain type
  const isSolana = selectedChain.type === 'solana';
  const addressPromptMessage = isSolana
    ? 'Enter the Solana wallet address (base58 encoded):'
    : 'Enter the wallet address to find deployed contracts:';

  const addressValidator = isSolana
    ? (address) => {
        // Basic Solana address validation (32-44 base58 characters)
        if (!address || address.length < 32 || address.length > 44) {
          return 'Please enter a valid Solana address (32-44 characters)';
        }
        return true;
      }
    : (address) => {
        // Basic Ethereum address validation (0x followed by 40 hex characters)
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return 'Please enter a valid Ethereum address (0x followed by 40 hex characters)';
        }
        return true;
      };

  // Prompt user for wallet address
  const addressResponse = await prompts({
    type: 'text',
    name: 'address',
    message: addressPromptMessage,
    validate: addressValidator
  });

  // Exit if user cancels the prompt
  if (!addressResponse.address) {
    console.log('Operation cancelled');
    process.exit(0);
  }

  const address = addressResponse.address;

  try {
    // Route to appropriate handler based on chain type
    if (isSolana) {
      // Handle Solana chains
      const result = await displaySolanaWalletInfo(address, rpcUrl, selectedChain.title);

      // Save to database
      if (result) {
        const queryId = saveSolanaQuery(
          selectedChain.title,
          selectedChain.type,
          address,
          rpcUrl,
          result.balance,
          result.tokenAccounts
        );
        console.log(`\n[Database] Query saved with ID: ${queryId}`);
      }
    } else {
      // Handle EVM chains
      console.log(`\nSearching for contracts deployed by ${address} on ${selectedChain.title}...`);

      // Call the findContractsDeployed function to retrieve the array of deployed contracts
      const contractAddresses = await findContractsDeployed(address, rpcUrl);

      // Log the contract addresses in a readable format by looping through the array
      if (contractAddresses.length === 0) {
        console.log(`\nNo contracts were deployed by ${address} on ${selectedChain.title}`);
      } else {
        console.log(`\nThe following contracts were deployed by ${address} on ${selectedChain.title}:`);
        for (let i = 0; i < contractAddresses.length; i++) {
          console.log(`${i + 1}. ${contractAddresses[i]}`);
        }

        // Voice narration for contracts found
        narrate('contracts_found', { count: contractAddresses.length });
      }

      // Save to database
      const queryId = saveEvmQuery(
        selectedChain.title,
        selectedChain.type,
        address,
        rpcUrl,
        contractAddresses
      );
      console.log(`\n[Database] Query saved with ID: ${queryId}`);

      // Voice narration for database save
      narrate('database_saved', { queryId });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the main function to start the script
main();
