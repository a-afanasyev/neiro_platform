/**
 * Performance Testing Script
 * Tests API response times and frontend performance metrics
 */

interface PerformanceResult {
  endpoint: string
  method: string
  avgTime: number
  minTime: number
  maxTime: number
  p95Time: number
  successRate: number
  totalRequests: number
}

const ITERATIONS = 10
const API_BASE = process.env.API_BASE || 'http://localhost:8080'
const TOKEN = process.env.TEST_TOKEN || ''

/**
 * Measure API endpoint performance
 */
async function measureEndpoint(
  method: string,
  endpoint: string,
  token?: string
): Promise<number[]> {
  const times: number[] = []

  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
      })

      if (!response.ok && response.status !== 401) {
        console.warn(`  Warning: ${endpoint} returned ${response.status}`)
      }

      const end = performance.now()
      times.push(end - start)
    } catch (error) {
      console.error(`  Error testing ${endpoint}:`, error)
      times.push(-1) // Mark as failed
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return times
}

/**
 * Calculate performance statistics
 */
function calculateStats(times: number[], endpoint: string, method: string): PerformanceResult {
  const validTimes = times.filter((t) => t > 0)
  const failedCount = times.filter((t) => t <= 0).length

  validTimes.sort((a, b) => a - b)

  const avgTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length
  const minTime = validTimes[0] || 0
  const maxTime = validTimes[validTimes.length - 1] || 0
  const p95Index = Math.floor(validTimes.length * 0.95)
  const p95Time = validTimes[p95Index] || maxTime

  return {
    endpoint,
    method,
    avgTime: Math.round(avgTime),
    minTime: Math.round(minTime),
    maxTime: Math.round(maxTime),
    p95Time: Math.round(p95Time),
    successRate: ((validTimes.length / times.length) * 100),
    totalRequests: times.length,
  }
}

/**
 * Format performance result
 */
function formatResult(result: PerformanceResult): string {
  const status = result.successRate === 100 ? '✅' : result.successRate >= 90 ? '⚠️' : '❌'
  const perf = result.p95Time < 200 ? '⚡' : result.p95Time < 500 ? '✅' : '⚠️'

  return `${status} ${perf} ${result.method.padEnd(6)} ${result.endpoint.padEnd(35)} | Avg: ${result.avgTime}ms | P95: ${result.p95Time}ms | Min: ${result.minTime}ms | Max: ${result.maxTime}ms | Success: ${result.successRate.toFixed(0)}%`
}

/**
 * Test all critical endpoints
 */
async function testAllEndpoints() {
  console.log('='.repeat(120))
  console.log('Performance Testing - Neiro Platform API')
  console.log('='.repeat(120))
  console.log(`Base URL: ${API_BASE}`)
  console.log(`Iterations per endpoint: ${ITERATIONS}`)
  console.log('')

  const results: PerformanceResult[] = []

  // Public endpoints (no auth required)
  const publicEndpoints = [
    { method: 'GET', path: '/auth/health' },
    { method: 'GET', path: '/users/health' },
    { method: 'GET', path: '/children/health' },
    { method: 'GET', path: '/diagnostics/health' },
    { method: 'GET', path: '/routes/health' },
    { method: 'GET', path: '/assignments/health' },
    { method: 'GET', path: '/exercises/health' },
    { method: 'GET', path: '/templates/health' },
    { method: 'GET', path: '/reports/health' },
    { method: 'GET', path: '/analytics/health' },
    { method: 'GET', path: '/notifications/health' },
  ]

  console.log('📊 Testing Health Check Endpoints (No Auth)')
  console.log('-'.repeat(120))

  for (const endpoint of publicEndpoints) {
    process.stdout.write(`  Testing ${endpoint.path}...`)
    const times = await measureEndpoint(endpoint.method, endpoint.path)
    const stats = calculateStats(times, endpoint.path, endpoint.method)
    results.push(stats)
    console.log(` Done (${stats.avgTime}ms avg)`)
  }

  console.log('')

  // Print results
  console.log('📈 Performance Results')
  console.log('-'.repeat(120))
  console.log('Legend: ✅ = Good | ⚠️ = Warning | ❌ = Failed | ⚡ = Fast (<200ms) | ✅ = OK (<500ms)')
  console.log('-'.repeat(120))

  results.forEach((result) => {
    console.log(formatResult(result))
  })

  console.log('')
  console.log('📊 Summary Statistics')
  console.log('-'.repeat(120))

  const avgOfAvgs = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length
  const avgP95 = results.reduce((sum, r) => sum + r.p95Time, 0) / results.length
  const overallSuccess = results.reduce((sum, r) => sum + r.successRate, 0) / results.length

  const fastEndpoints = results.filter((r) => r.p95Time < 200).length
  const okEndpoints = results.filter((r) => r.p95Time >= 200 && r.p95Time < 500).length
  const slowEndpoints = results.filter((r) => r.p95Time >= 500).length

  console.log(`  Average Response Time: ${Math.round(avgOfAvgs)}ms`)
  console.log(`  Average P95 Time: ${Math.round(avgP95)}ms`)
  console.log(`  Overall Success Rate: ${overallSuccess.toFixed(1)}%`)
  console.log(`  Fast Endpoints (<200ms): ${fastEndpoints}/${results.length}`)
  console.log(`  OK Endpoints (200-500ms): ${okEndpoints}/${results.length}`)
  console.log(`  Slow Endpoints (>500ms): ${slowEndpoints}/${results.length}`)

  console.log('')
  console.log('🎯 Performance Goals')
  console.log('-'.repeat(120))

  const goalP95 = avgP95 < 200
  const goalSuccess = overallSuccess >= 99

  console.log(`  ✅ API Latency P95 < 200ms: ${goalP95 ? '✅ PASS' : `⚠️ FAIL (${Math.round(avgP95)}ms)`}`)
  console.log(`  ✅ Success Rate > 99%: ${goalSuccess ? '✅ PASS' : `⚠️ FAIL (${overallSuccess.toFixed(1)}%)`}`)

  console.log('')
  console.log('='.repeat(120))

  if (goalP95 && goalSuccess) {
    console.log('✅ All performance goals met!')
  } else {
    console.log('⚠️ Some performance goals not met. Review results above.')
  }

  console.log('='.repeat(120))
  console.log('')

  return results
}

/**
 * Run performance tests
 */
async function main() {
  try {
    await testAllEndpoints()
    console.log('✅ Performance testing completed successfully!')
  } catch (error) {
    console.error('❌ Performance testing failed:', error)
    process.exit(1)
  }
}

// Run tests
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
