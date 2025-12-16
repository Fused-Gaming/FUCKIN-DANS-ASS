#!/usr/bin/env node
// Test MCP Server Functionality
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test addresses for MCP queries
const TEST_ADDRESSES = {
  UNISWAP_ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86a33E6441D6E5E5e6e6e6e6e6e6e6e6e6e6e'
};

const TEST_QUERIES = [
  {
    tool: 'check-balance',
    address: TEST_ADDRESSES.UNISWAP_ROUTER,
    description: 'Check Uniswap Router ETH balance'
  },
  {
    tool: 'get-gas-prices',
    description: 'Get current gas prices'
  },
  {
    tool: 'get-ens-name',
    address: TEST_ADDRESSES.UNISWAP_ROUTER,
    description: 'Check ENS name for Uniswap Router'
  }
];

function createMCPRequest(toolName, args = {}) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: `test-${Date.now()}`,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args
    }
  }) + '\n';
}

async function testMCPQuery(mcpProcess, query) {
  return new Promise((resolve, reject) => {
    let responseData = '';
    let timeout = setTimeout(() => {
      reject(new Error('MCP query timeout'));
    }, 10000);

    const dataHandler = (data) => {
      responseData += data.toString();
      try {
        const response = JSON.parse(responseData);
        clearTimeout(timeout);
        mcpProcess.stdout.off('data', dataHandler);
        resolve(response);
      } catch (e) {
        // Still collecting data
      }
    };

    mcpProcess.stdout.on('data', dataHandler);
    mcpProcess.stdin.write(createMCPRequest(query.tool, query.address ? { address: query.address } : {}));
  });
}

async function runMCPTests() {
  console.log('🔗 Testing Etherscan MCP Server Integration...\n');

  try {
    // Start MCP server
    const mcpProcess = spawn('node', ['mcp-etherscan-server/build/index.js'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📡 MCP Server started, testing queries...\n');

    // Test each query
    const results = [];
    for (const query of TEST_QUERIES) {
      console.log(`🔍 Testing: ${query.description}`);
      
      try {
        const result = await testMCPQuery(mcpProcess, query);
        console.log(`✅ SUCCESS: ${query.description}`);
        console.log(`📄 Response: ${JSON.stringify(result.result || result.error || result, null, 2)}\n`);
        results.push({ query: query.description, status: 'success', result });
      } catch (error) {
        console.log(`❌ FAILED: ${query.description}`);
        console.log(`⚠️ Error: ${error.message}\n`);
        results.push({ query: query.description, status: 'failed', error: error.message });
      }
    }

    // Cleanup
    mcpProcess.kill();

    // Summary
    console.log('📊 MCP SERVER TEST SUMMARY');
    console.log('═══════════════════════════════');
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`✅ Successful: ${successCount}/${results.length}`);
    
    results.forEach(result => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${result.query}`);
    });

    console.log('\n🎯 MCP Integration Status:', successCount === results.length ? 'FULLY OPERATIONAL' : 'PARTIAL');
    
    return results;

  } catch (error) {
    console.error('❌ MCP server test failed:', error.message);
    return [];
  }
}

// Run tests if called directly
if (require.main === module) {
  runMCPTests()
    .then((results) => {
      process.exit(results.filter(r => r.status === 'success').length === results.length ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runMCPTests, TEST_ADDRESSES, TEST_QUERIES };
