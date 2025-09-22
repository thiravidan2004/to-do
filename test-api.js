#!/usr/bin/env node

/**
 * API Test Script for Multi-Tenant Todo API
 * 
 * Usage:
 * node test-api.js [base-url] [admin-key]
 * 
 * Example:
 * node test-api.js http://localhost:3000/api/v1 admin_your_key
 * node test-api.js https://your-app.vercel.app/api/v1 admin_your_key
 */

const baseUrl = process.argv[2] || 'http://localhost:3000/api/v1'
const adminKey = process.argv[3] || 'admin_your_secure_admin_key_here_123456789'

console.log(`🧪 Testing Todo API at: ${baseUrl}`)
console.log(`🔑 Using admin key: ${adminKey.substring(0, 10)}...`)
console.log('=' .repeat(50))

let testCompanyApiKey = null
let testTaskId = null

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { response, data }
  } catch (error) {
    return { error: error.message }
  }
}

async function test1_CheckAPIStatus() {
  console.log('\n1️⃣  Testing API Status...')
  
  const { response, data, error } = await makeRequest(`${baseUrl}/status`)
  
  if (error) {
    console.log('❌ API Status Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    console.log('✅ API Status OK')
    console.log(`   Version: ${data.version}`)
    console.log(`   Database: ${data.services.database.status}`)
    return true
  } else {
    console.log('❌ API Status Failed:', data)
    return false
  }
}

async function test2_CreateCompany() {
  console.log('\n2️⃣  Creating Test Company...')
  
  const { response, data, error } = await makeRequest(`${baseUrl}/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    },
    body: JSON.stringify({
      name: `Test Company ${Date.now()}`
    })
  })
  
  if (error) {
    console.log('❌ Create Company Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    testCompanyApiKey = data.data.api_key
    console.log('✅ Company Created Successfully')
    console.log(`   Company ID: ${data.data.id}`)
    console.log(`   API Key: ${testCompanyApiKey.substring(0, 15)}...`)
    return true
  } else {
    console.log('❌ Create Company Failed:', response.status, data)
    return false
  }
}

async function test3_GetTasksEmpty() {
  console.log('\n3️⃣  Testing Get Tasks (should be empty)...')
  
  if (!testCompanyApiKey) {
    console.log('❌ No API key available')
    return false
  }
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks`, {
    headers: {
      'x-api-key': testCompanyApiKey
    }
  })
  
  if (error) {
    console.log('❌ Get Tasks Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    console.log('✅ Get Tasks OK')
    console.log(`   Tasks Count: ${data.data.length}`)
    console.log(`   Rate Limit Remaining: ${data.meta.rateLimitRemaining}`)
    return true
  } else {
    console.log('❌ Get Tasks Failed:', response.status, data)
    return false
  }
}

async function test4_CreateTask() {
  console.log('\n4️⃣  Creating Test Task...')
  
  if (!testCompanyApiKey) {
    console.log('❌ No API key available')
    return false
  }
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': testCompanyApiKey
    },
    body: JSON.stringify({
      title: 'Test Task from API Test',
      description: 'This task was created by the test script',
      completed: false
    })
  })
  
  if (error) {
    console.log('❌ Create Task Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    testTaskId = data.data.id
    console.log('✅ Task Created Successfully')
    console.log(`   Task ID: ${testTaskId}`)
    console.log(`   Title: ${data.data.title}`)
    return true
  } else {
    console.log('❌ Create Task Failed:', response.status, data)
    return false
  }
}

async function test5_UpdateTask() {
  console.log('\n5️⃣  Updating Test Task...')
  
  if (!testCompanyApiKey || !testTaskId) {
    console.log('❌ No API key or task ID available')
    return false
  }
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks/${testTaskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': testCompanyApiKey
    },
    body: JSON.stringify({
      title: 'Updated Test Task',
      completed: true
    })
  })
  
  if (error) {
    console.log('❌ Update Task Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    console.log('✅ Task Updated Successfully')
    console.log(`   Title: ${data.data.title}`)
    console.log(`   Completed: ${data.data.completed}`)
    return true
  } else {
    console.log('❌ Update Task Failed:', response.status, data)
    return false
  }
}

async function test6_GetSingleTask() {
  console.log('\n6️⃣  Getting Single Task...')
  
  if (!testCompanyApiKey || !testTaskId) {
    console.log('❌ No API key or task ID available')
    return false
  }
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks/${testTaskId}`, {
    headers: {
      'x-api-key': testCompanyApiKey
    }
  })
  
  if (error) {
    console.log('❌ Get Single Task Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    console.log('✅ Get Single Task OK')
    console.log(`   Title: ${data.data.title}`)
    console.log(`   Completed: ${data.data.completed}`)
    return true
  } else {
    console.log('❌ Get Single Task Failed:', response.status, data)
    return false
  }
}

async function test7_TestRateLimit() {
  console.log('\n7️⃣  Testing Rate Limit (making 5 quick requests)...')
  
  if (!testCompanyApiKey) {
    console.log('❌ No API key available')
    return false
  }
  
  let successCount = 0
  
  for (let i = 0; i < 5; i++) {
    const { response, data } = await makeRequest(`${baseUrl}/tasks`, {
      headers: {
        'x-api-key': testCompanyApiKey
      }
    })
    
    if (response.ok) {
      successCount++
    }
    
    if (i === 4) { // Last request
      console.log(`✅ Rate Limit Test: ${successCount}/5 requests successful`)
      if (data.meta) {
        console.log(`   Rate Limit Remaining: ${data.meta.rateLimitRemaining}`)
      }
    }
  }
  
  return true
}

async function test8_TestInvalidApiKey() {
  console.log('\n8️⃣  Testing Invalid API Key...')
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks`, {
    headers: {
      'x-api-key': 'invalid_key_123'
    }
  })
  
  if (error) {
    console.log('❌ Invalid API Key Test Failed:', error)
    return false
  }
  
  if (response.status === 401) {
    console.log('✅ Invalid API Key Properly Rejected')
    return true
  } else {
    console.log('❌ Invalid API Key Should Have Been Rejected')
    return false
  }
}

async function test9_DeleteTask() {
  console.log('\n9️⃣  Deleting Test Task...')
  
  if (!testCompanyApiKey || !testTaskId) {
    console.log('❌ No API key or task ID available')
    return false
  }
  
  const { response, data, error } = await makeRequest(`${baseUrl}/tasks/${testTaskId}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': testCompanyApiKey
    }
  })
  
  if (error) {
    console.log('❌ Delete Task Failed:', error)
    return false
  }
  
  if (response.ok && data.success) {
    console.log('✅ Task Deleted Successfully')
    return true
  } else {
    console.log('❌ Delete Task Failed:', response.status, data)
    return false
  }
}

// Global fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

async function runTests() {
  const tests = [
    test1_CheckAPIStatus,
    test2_CreateCompany,
    test3_GetTasksEmpty,
    test4_CreateTask,
    test5_UpdateTask,
    test6_GetSingleTask,
    test7_TestRateLimit,
    test8_TestInvalidApiKey,
    test9_DeleteTask
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`)
      failed++
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n' + '=' .repeat(50))
  console.log(`🎯 Test Results: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your API is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.')
  }
  
  if (testCompanyApiKey) {
    console.log(`\n💡 Test company API key: ${testCompanyApiKey}`)
    console.log('   You can use this for further testing.')
  }
}

// Check if we need to install node-fetch
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch for Node.js compatibility...')
  try {
    require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' })
    global.fetch = require('node-fetch')
  } catch (error) {
    console.log('❌ Failed to install node-fetch. Please install it manually:')
    console.log('   npm install node-fetch@2')
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})
