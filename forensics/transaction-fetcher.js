// Transaction history fetcher for forensic analysis
require('dotenv').config();
const { saveTransactionsBatch } = require('../database/db');
const { importAddressLabels } = require('./etherscan-label-importer');

const SOLANA_TRANSFER_TYPES = new Set([
  'transfer',
  'transferchecked',
  'transfercheckedwithfee',
  'transfercheckedwithfeev2',
  'transferwithseed'
]);

function flattenSolanaInstructions(tx) {
  const main = tx?.transaction?.message?.instructions || [];
  const inner = (tx?.meta?.innerInstructions || []).flatMap(i => i.instructions || []);
  return [...main, ...inner];
}

function deriveSolanaParticipants(tx) {
  const instructions = flattenSolanaInstructions(tx).filter(instr => instr?.parsed);

  for (const instr of instructions) {
    const parsed = instr.parsed || {};
    const type = (parsed.type || '').toLowerCase();

    if (!SOLANA_TRANSFER_TYPES.has(type)) continue;

    const info = parsed.info || {};

    const from = info.source || info.authority || info.owner || info.wallet || info.from || info.multisigAuthority || null;
    const to = info.destination || info.account || info.recipient || info.to || null;
    const amount = info.lamports || info.amount || info.tokenAmount?.amount || info.tokenAmount?.uiAmountString || null;
    const contractAddress = info.mint || info.programId || null;

    return {
      from,
      to,
      amount: amount ? amount.toString() : '0',
      contractAddress,
      methodId: parsed.type || null
    };
  }

  const accountKeys = tx?.transaction?.message?.accountKeys || [];
  const fallbackFrom = accountKeys[0]?.pubkey || accountKeys[0] || null;
  const fallbackTo = accountKeys[1]?.pubkey || accountKeys[1] || null;

  return {
    from: fallbackFrom,
    to: fallbackTo,
    amount: '0',
    contractAddress: null,
    methodId: null
  };
}

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

async function fetchSolanaTransaction(signature, rpcUrl) {
  const requestBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "getTransaction",
    params: [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
  };

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  return data.result;
}

async function fetchSolanaTransactionHistory(address, rpcUrl, chainName, options = {}) {
  const { maxCount = 500 } = options;

  console.log(`\nFetching transaction history for ${address} on ${chainName} (Solana)...`);

  const allTransactions = [];
  let before = undefined;

  while (allTransactions.length < maxCount) {
    const limit = Math.min(1000, maxCount - allTransactions.length);
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getSignaturesForAddress",
      params: [address, { limit, ...(before ? { before } : {}) }]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Error fetching signatures:", data.error);
      break;
    }

    const signatures = data.result || [];
    if (signatures.length === 0) break;

    before = signatures[signatures.length - 1].signature;

    for (const sigObj of signatures) {
      if (allTransactions.length >= maxCount) break;

      const tx = await fetchSolanaTransaction(sigObj.signature, rpcUrl);
      if (!tx) continue;

      const participants = deriveSolanaParticipants(tx);
      const blockTime = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null;

      allTransactions.push({
        hash: sigObj.signature,
        chainName,
        blockNumber: tx.slot || null,
        timestamp: blockTime,
        from: participants.from,
        to: participants.to,
        value: participants.amount,
        gasUsed: tx.meta?.fee?.toString() || null,
        gasPrice: null,
        input: null,
        contractAddress: participants.contractAddress || null,
        status: tx.meta?.err ? 0 : 1,
        methodId: participants.methodId
      });
    }

    if (signatures.length < limit) break;
  }

  console.log(`\nTotal Solana transactions found: ${allTransactions.length}`);
  return allTransactions;
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
 * Extract unique addresses from transactions and import Etherscan labels
 */
async function importLabelsForAddresses(transactions, chainName) {
  const uniqueAddresses = new Set();

  // Collect all unique addresses from transactions
  for (const tx of transactions) {
    if (tx.from) uniqueAddresses.add(tx.from.toLowerCase());
    if (tx.to) uniqueAddresses.add(tx.to.toLowerCase());
    if (tx.contractAddress) uniqueAddresses.add(tx.contractAddress.toLowerCase());
  }

  const addressList = Array.from(uniqueAddresses);

  if (addressList.length === 0) {
    return;
  }

  console.log(`\nImporting Etherscan labels for ${addressList.length} unique addresses...`);

  // Import labels for each address (includes both public and private tags)
  let imported = 0;
  for (const addr of addressList) {
    try {
      const result = await importAddressLabels(addr, chainName, {
        includePrivateTags: true,
        silent: true
      });
      if (result && result.imported > 0) {
        imported += result.imported;
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      // Continue on error - some addresses may not have labels
      continue;
    }
  }

  if (imported > 0) {
    console.log(`✓ Imported ${imported} labels from Etherscan`);
  } else {
    console.log('No Etherscan labels found for these addresses');
  }
}

/**
 * Fetch and store complete transaction history for an address
 */
async function collectAddressHistory(address, rpcUrl, chainName, options = {}) {
  try {
    // Validate RPC URL
    if (!rpcUrl || rpcUrl === 'undefined') {
      console.log('⚠️ No RPC URL provided - skipping transaction fetch');
      return { transactions: [] };
    }

    const transactions = await fetchTransactionHistory(address, rpcUrl, chainName, options);

    if (transactions.length === 0) {
      console.log('No transactions found.');
      return { transactions: [] };
    }

    // Save to database
    console.log('\nSaving transactions to database...');
    saveTransactionsBatch(transactions);
    console.log(`Successfully saved ${transactions.length} transactions.`);

    // Import Etherscan labels for all addresses in transactions
    await importLabelsForAddresses(transactions, chainName);

    return { transactions };
  } catch (error) {
    console.error('Error collecting address history:', error);
    return { transactions: [], error: error.message };
  }
}

async function collectSolanaAddressHistory(address, rpcUrl, chainName, options = {}) {
  try {
    const transactions = await fetchSolanaTransactionHistory(address, rpcUrl, chainName, options);

    if (transactions.length === 0) {
      console.log('No transactions found.');
      return [];
    }

    console.log('\nSaving transactions to database...');
    saveTransactionsBatch(transactions);
    console.log(`Successfully saved ${transactions.length} transactions.`);

    return transactions;
  } catch (error) {
    console.error('Error collecting Solana address history:', error);
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
  traceFundFlow,
  fetchSolanaTransactionHistory,
  collectSolanaAddressHistory
};
