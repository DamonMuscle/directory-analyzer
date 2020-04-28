$scanPath = $args[0]

$outputFolder = $args[1]

Write-Host "scan path: $scanPath"

$timeStamp = Get-Date -Format "yyyyMMddTHHmmss"

Write-Host "output directory: $outputFolder"

$output = "$outputFolder\$timeStamp stats.txt"

Write-Host "output full path: $output"

$errorPath = "$outputFolder\$timeStamp error.txt"

Get-ChildItem -Path $scanPath -File -Recurse -ErrorAction SilentlyContinue -ErrorVariable $errorDetails | Out-File $output

$errorDetails | Out-File $errorPath
