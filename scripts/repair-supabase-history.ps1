param(
  [string]$StartAt = "20260813000001",
  [int]$MaxRetries = 4
)

$ErrorActionPreference = "Stop"

# The production schema predates CLI migration tracking. Mark the existing
# migrations as applied, leaving the new security migration pending.
$existingVersions = @(
+  "20260813000001"
  "20260813000002"
  "20260813000003"
  "20260813000004"
  "20260813000005"
  "20260813000006"
  "20260813000007"
  "20260813000008"
  "20260813000009"
  "20260813000010"
  "20260813000011"
  "20260813000012"
  "20260813000013"
  "20260813000014"
  "20260813000015"
  "20260813000016"
  "20260813000017"
  "20260813000018"
  "20260813000019"
  "20260813000020"
  "20260813000021"
  "20260813000022"
  "20260813000023"
  "20260813000024"
  "20260813000025"
  "20260813000026"
  "20260813000027"
  "20260813000028"
  "20260813000030"
  "20260813000031"
  "20260813000032"
  "20260813000033"
)

foreach ($version in $existingVersions) {
  if ([string]::CompareOrdinal($version, $StartAt) -lt 0) {
    continue
  }
  Write-Host "Marking existing migration $version as applied..."
  $completed = $false
  for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
    npx supabase migration repair $version --status applied
    if ($LASTEXITCODE -eq 0) {
      $completed = $true
      break
    }
    if ($attempt -lt $MaxRetries) {
      $delay = 5 * $attempt
      Write-Warning "Connection failed for $version. Retrying in $delay seconds ($attempt/$MaxRetries)..."
      Start-Sleep -Seconds $delay
    }
  }
  if (-not $completed) {
    throw "Failed to repair migration $version after $MaxRetries attempts. Resume with: .\scripts\repair-supabase-history.ps1 -StartAt $version"
  }
}

Write-Host "Pushing the pending security migration..."
npx supabase db push --include-all
if ($LASTEXITCODE -ne 0) {
  throw "Database push failed"
}

Write-Host "Migration history repaired and security migration applied."
