// Solana-specific functions for querying wallet data

/**
 * Get deployed Solana programs (contracts) by a wallet
 * Note: Solana doesn't track program deployments the same way as EVM chains
 * This function gets programs owned by the wallet address
 */
async function getSolanaPrograms(address, rpcUrl) {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getProgramAccounts",
      params: [
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", // SPL Token Program
        {
          encoding: "jsonParsed",
          filters: [
            {
              memcmp: {
                offset: 32,
                bytes: address
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Solana API Error:", data.error);
      return [];
    }

    return data.result || [];
  } catch (error) {
    console.error("Error fetching Solana programs:", error);
    return [];
  }
}

/**
 * Get token accounts owned by a Solana wallet
 */
async function getSolanaTokenAccounts(address, rpcUrl) {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        address,
        {
          programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          encoding: "jsonParsed"
        }
      ]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Solana API Error:", data.error);
      return [];
    }

    return data.result?.value || [];
  } catch (error) {
    console.error("Error fetching Solana token accounts:", error);
    return [];
  }
}

/**
 * Get SOL balance for a wallet
 */
async function getSolanaBalance(address, rpcUrl) {
  try {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address]
    };

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.error) {
      console.error("Solana API Error:", data.error);
      return null;
    }

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    return data.result?.value ? data.result.value / 1000000000 : 0;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return null;
  }
}

/**
 * Main function to display Solana wallet information
 */
async function displaySolanaWalletInfo(address, rpcUrl, chainName) {
  console.log(`\nQuerying Solana wallet: ${address} on ${chainName}...`);
  console.log("Note: Solana uses a different architecture than EVM chains.\n");

  // Get SOL balance
  const balance = await getSolanaBalance(address, rpcUrl);
  if (balance !== null) {
    console.log(`SOL Balance: ${balance.toFixed(9)} SOL`);
  }

  // Get token accounts
  console.log("\nFetching token accounts...");
  const tokenAccounts = await getSolanaTokenAccounts(address, rpcUrl);

  if (tokenAccounts.length === 0) {
    console.log("No token accounts found for this wallet.");
  } else {
    console.log(`\nFound ${tokenAccounts.length} token account(s):`);
    tokenAccounts.forEach((account, index) => {
      const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
      const mint = account.account?.data?.parsed?.info?.mint;

      if (tokenAmount && mint) {
        const amount = tokenAmount.uiAmount || 0;
        const decimals = tokenAmount.decimals || 0;
        console.log(`${index + 1}. Token Mint: ${mint}`);
        console.log(`   Amount: ${amount} (Decimals: ${decimals})`);
        console.log(`   Account: ${account.pubkey}`);
      }
    });
  }

  console.log("\n" + "=".repeat(80));
  console.log("Solana Program Deployment Tracking:");
  console.log("Unlike EVM chains, Solana programs are typically deployed by specialized");
  console.log("deployment tools and the deployment history is not easily queryable via RPC.");
  console.log("For program deployment history, use Solana explorers like Solscan or Solana FM.");
  console.log("=".repeat(80));

  // Return data for database storage
  return {
    balance: balance || 0,
    tokenAccounts: tokenAccounts
  };
}

module.exports = {
  displaySolanaWalletInfo,
  getSolanaPrograms,
  getSolanaTokenAccounts,
  getSolanaBalance
};
