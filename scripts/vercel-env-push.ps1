# Uso local: rellena variables en Vercel desde .env.local (no sube el archivo)
$names = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ALLOWED_EMAIL",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "CRON_SECRET",
  "TOKEN_ENCRYPTION_KEY"
)

foreach ($name in $names) {
  $line = Get-Content "..\.env.local" -ErrorAction SilentlyContinue | Where-Object { $_ -match "^$name=" }
  if (-not $line) { continue }
  $value = ($line -replace "^$name=", "").Trim('"')
  Write-Host "Setting $name ..."
  $value | vercel env add $name production --force 2>&1 | Out-Null
}

Write-Host "Listo. Actualiza NEXT_PUBLIC_APP_URL tras el primer deploy."
