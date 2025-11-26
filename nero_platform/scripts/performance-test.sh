#!/bin/bash

# Performance Testing Script for Neiro Platform
# Tests API response times using curl

API_BASE="${API_BASE:-http://localhost:8080}"
ITERATIONS=10

echo "========================================================================================================================"
echo "Performance Testing - Neiro Platform API"
echo "========================================================================================================================"
echo "Base URL: $API_BASE"
echo "Iterations per endpoint: $ITERATIONS"
echo ""

# Health check endpoints
ENDPOINTS=(
  "/auth/health"
  "/users/health"
  "/children/health"
  "/diagnostics/health"
  "/routes/health"
  "/assignments/health"
  "/exercises/health"
  "/templates/health"
  "/reports/health"
  "/analytics/health"
  "/notifications/health"
)

# Create curl format file for timing
cat > /tmp/curl-format.txt << 'EOF'
%{time_total}
EOF

echo "📊 Testing Health Check Endpoints"
echo "------------------------------------------------------------------------------------------------------------------------"

declare -A results_sum
declare -A results_count
declare -A results_times

# Test each endpoint
for endpoint in "${ENDPOINTS[@]}"; do
  echo -n "  Testing $endpoint..."

  times=()
  success_count=0

  for i in $(seq 1 $ITERATIONS); do
    time_ms=$(curl -w "@/tmp/curl-format.txt" -o /dev/null -s "$API_BASE$endpoint" 2>/dev/null | awk '{printf "%.0f", $1 * 1000}')

    if [ -n "$time_ms" ] && [ "$time_ms" -gt 0 ]; then
      times+=($time_ms)
      success_count=$((success_count + 1))
    fi

    sleep 0.1
  done

  # Calculate statistics
  if [ ${#times[@]} -gt 0 ]; then
    # Sort times
    IFS=$'\n' sorted_times=($(sort -n <<<"${times[*]}"))
    unset IFS

    # Calculate avg, min, max, p95
    sum=0
    for t in "${times[@]}"; do
      sum=$((sum + t))
    done
    avg=$((sum / ${#times[@]}))
    min=${sorted_times[0]}
    max=${sorted_times[${#sorted_times[@]}-1]}
    p95_index=$(( ${#sorted_times[@]} * 95 / 100 ))
    p95=${sorted_times[$p95_index]}

    success_rate=$((success_count * 100 / ITERATIONS))

    # Store results
    results_sum["$endpoint"]=$sum
    results_count["$endpoint"]=${#times[@]}
    results_times["$endpoint"]="$avg,$min,$max,$p95,$success_rate"

    echo " Done (${avg}ms avg)"
  else
    echo " Failed"
    results_times["$endpoint"]="0,0,0,0,0"
  fi
done

echo ""
echo "📈 Performance Results"
echo "------------------------------------------------------------------------------------------------------------------------"
echo "Legend: ⚡ = Fast (<50ms) | ✅ = Good (<200ms) | ⚠️ = Warning (200-500ms) | ❌ = Slow (>500ms)"
echo "------------------------------------------------------------------------------------------------------------------------"

total_avg=0
total_p95=0
total_success=0
count=0
fast_count=0
good_count=0
warn_count=0
slow_count=0

for endpoint in "${ENDPOINTS[@]}"; do
  IFS=',' read -r avg min max p95 success <<< "${results_times[$endpoint]}"

  # Determine status icons
  if [ "$p95" -lt 50 ]; then
    perf_icon="⚡"
    fast_count=$((fast_count + 1))
  elif [ "$p95" -lt 200 ]; then
    perf_icon="✅"
    good_count=$((good_count + 1))
  elif [ "$p95" -lt 500 ]; then
    perf_icon="⚠️"
    warn_count=$((warn_count + 1))
  else
    perf_icon="❌"
    slow_count=$((slow_count + 1))
  fi

  if [ "$success" -eq 100 ]; then
    status_icon="✅"
  elif [ "$success" -ge 90 ]; then
    status_icon="⚠️"
  else
    status_icon="❌"
  fi

  printf "  %s %s %-40s | Avg: %4dms | P95: %4dms | Min: %4dms | Max: %4dms | Success: %3d%%\n" \
    "$status_icon" "$perf_icon" "$endpoint" "$avg" "$p95" "$min" "$max" "$success"

  total_avg=$((total_avg + avg))
  total_p95=$((total_p95 + p95))
  total_success=$((total_success + success))
  count=$((count + 1))
done

echo ""
echo "📊 Summary Statistics"
echo "------------------------------------------------------------------------------------------------------------------------"

avg_of_avgs=$((total_avg / count))
avg_p95=$((total_p95 / count))
overall_success=$((total_success / count))

echo "  Average Response Time: ${avg_of_avgs}ms"
echo "  Average P95 Time: ${avg_p95}ms"
echo "  Overall Success Rate: ${overall_success}%"
echo "  Fast Endpoints (<50ms): $fast_count/$count"
echo "  Good Endpoints (50-200ms): $good_count/$count"
echo "  Warning Endpoints (200-500ms): $warn_count/$count"
echo "  Slow Endpoints (>500ms): $slow_count/$count"

echo ""
echo "🎯 Performance Goals"
echo "------------------------------------------------------------------------------------------------------------------------"

goal_p95="⚠️ FAIL"
goal_success="⚠️ FAIL"

if [ "$avg_p95" -lt 200 ]; then
  goal_p95="✅ PASS"
fi

if [ "$overall_success" -ge 99 ]; then
  goal_success="✅ PASS"
fi

echo "  API Latency P95 < 200ms: $goal_p95 (${avg_p95}ms)"
echo "  Success Rate > 99%: $goal_success (${overall_success}%)"

echo ""
echo "========================================================================================================================"

if [ "$avg_p95" -lt 200 ] && [ "$overall_success" -ge 99 ]; then
  echo "✅ All performance goals met!"
else
  echo "⚠️ Some performance goals not met. Review results above."
fi

echo "========================================================================================================================"
echo ""

# Cleanup
rm -f /tmp/curl-format.txt
