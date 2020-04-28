$folder = $args[0]

$timeStamp = Get-Date -Format "yyyyMMddTHHmmss"

Write-Host $folder

New-Item -Path $folder -Name "statsResult" -ItemType "directory" -Force

$output = "$folder\statsResult\$timeStamp stats.txt"

Write-Host $output

$errorPath = "$folder\statsResult\$timeStamp error.txt"

Write-Host $errorPath

Get-ChildItem -Path "C:\" -File -Recurse -ErrorAction SilentlyContinue -ErrorVariable $errorDetails | Out-File $output

$errorDetails | Out-File $errorPath
