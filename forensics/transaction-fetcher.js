// Transaction history fetcher for forensic analysis
require('dotenv').config();
const { saveTransactionsBatch } = require('../database/db');

/**
 * Fetch transaction history for an address using Alchemy
 */
async function fetchTransactionHistory(address, rpcUrl, chainName, options = {}) {
  const {
    fromBlock = '0x0',
    toBlock = 'latest',
    category = ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
    maxCount = 1000,
    withMetadata = true
  } = options;

  console.log(`\nFetching transaction history for ${address} on ${chainName}...`);

  const allTransfers = [];
  let pageKey = undefined;
  let fetchCount = 0;

  do {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromBlock,
        toBlock,
        fromAddress: address,
        category,
        withMetadata,
        maxCount: Math.min(1000, maxCount - fetchCount),
        ...(pageKey && { pageKey })
      }]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching FROM transactions:", data.error);
      break;
    }

    const transfers = data.result.transfers || [];
    allTransfers.push(...transfers);
    fetchCount += transfers.length;
    pageKey = data.result.pageKey;

    console.log(`Fetched ${fetchCount} outgoing transactions...`);

    if (fetchCount >= maxCount) break;
  } while (pageKey);

  // Also fetch transactions TO this address
  pageKey = undefined;
  let toCount = 0;

  do {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [{
        fromBlock,
        toBlock,
        toAddress: address,
        category,
        withMetadata,
        maxCount: Math.min(1000, maxCount - toCount),
        ...(pageKey && { pageKey })
      }]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching TO transactions:", data.error);
      break;
    }

    const transfers = data.result.transfers || [];
    allTransfers.push(...transfers);
    toCount += transfers.length;
    pageKey = data.result.pageKey;

    console.log(`Fetched ${toCount} incoming transactions...`);

    if (toCount >= maxCount) break;
  } while (pageKey);

  console.log(`\nTotal transactions found: ${allTransfers.length}`);

  // Transform to our database format
  const transactions = allTransfers.map(tx => ({
    hash: tx.hash,
    chainName: chainName,
    blockNumber: parseInt(tx.blockNum, 16),
    timestamp: tx.metadata?.blockTimestamp || null,
    from: tx.from,
    to: tx.to,
    value: tx.value?.toString() || '0',
    gasUsed: null, // Will need separate call for this
    gasPrice: null,
    input: tx.rawContract?.rawValue || null,
    contractAddress: tx.rawContract?.address || null,
    status: 1, // Asset transfers are successful by default
    methodId: null
  }));

  return transactions;
}

/**
 * Fetch detailed transaction receipts for forensic analysis
 */
async function fetchTransactionDetails(txHash, rpcUrl, chainName) {
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionByHash",
    params: [txHash]
  };

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  if (data.error || !data.result) {
    return null;
  }

  const tx = data.result;

  // Get receipt for status and gas used
  const receiptBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionReceipt",
    params: [txHash]
  };

  const receiptResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receiptBody)
  });

  const receiptData = await receiptResponse.json();
  const receipt = receiptData.result;

  // Get block timestamp
  const blockBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getBlockByNumber",
    params: [tx.blockNumber, false]
  };

  const blockResponse = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blockBody)
  });

  const blockData = await blockResponse.json();
  const block = blockData.result;

  const methodId = tx.input && tx.input.length >= 10 ? tx.input.substring(0, 10) : null;

  return {
    hash: tx.hash,
    chainName: chainName,
    blockNumber: parseInt(tx.blockNumber, 16),
    timestamp: block ? new Date(parseInt(block.timestamp, 16) * 1000).toISOString() : null,
    from: tx.from,
    to: tx.to,
    value: parseInt(tx.value, 16).toString(),
    gasUsed: receipt ? parseInt(receipt.gasUsed, 16).toString() : null,
    gasPrice: parseInt(tx.gasPrice, 16).toString(),
    input: tx.input,
    contractAddress: receipt?.contractAddress || null,
    status: receipt ? parseInt(receipt.status, 16) : 1,
    methodId: methodId
  };
}

/**
 * Fetch and store complete transaction history for an address
 */
async function collectAddressHistory(address, rpcUrl, chainName, options = {}) {
  try {
    const transactions = await fetchTransactionHistory(address, rpcUrl, chainName, options);

    if (transactions.length === 0) {
      console.log('No transactions found.');
      return [];
    }

    // Save to database
    console.log('\nSaving transactions to database...');
    saveTransactionsBatch(transactions);
    console.log(`Successfully saved ${transactions.length} transactions.`);

    return transactions;
  } catch (error) {
    console.error('Error collecting address history:', error);
    throw error;
  }
}

/**
 * Get transactions between two addresses (potential fund flow)
 */
async function traceFundFlow(fromAddress, toAddress, rpcUrl, chainName) {
  console.log(`\nTracing fund flow from ${fromAddress} to ${toAddress}...`);

  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getAssetTransfers",
    params: [{
      fromBlock: "0x0",
      toBlock: "latest",
      fromAddress: fromAddress,
      toAddress: toAddress,
      category: ['external', 'internal', 'erc20', 'erc721', 'erc1155'],
      withMetadata: true
    }]
  };

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  if (data.error) {
    console.error("Error:", data.error);
    return [];
  }

  const transfers = data.result.transfers || [];
  console.log(`Found ${transfers.length} direct transfers between addresses.`);

  return transfers;
}

module.exports = {
  fetchTransactionHistory,
  fetchTransactionDetails,
  collectAddressHistory,
  traceFundFlow
};
