# AWS deployment helper for Claims Agent project
# Run from the repo root: pwsh .\aws\deploy.ps1

Write-Host "Checking for AWS credentials..."
try {
    aws sts get-caller-identity | Out-Null
} catch {
    Write-Host "ERROR: AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

Write-Host "Installing backend dependencies..."
pm.cmd install

Write-Host "Building backend with SAM..."
sam build

Write-Host "Deploying backend..."
sam deploy --guided

Write-Host "Backend deployed. When you have the ApiUrl and WebBucketName values, run the frontend build/upload section below."

$apiUrl = Read-Host "Enter ApiUrl (from SAM output, e.g. https://xxx.execute-api.region.amazonaws.com/prod)"
if (-not $apiUrl) {
    Write-Host "Skipping frontend build because ApiUrl was not provided." -ForegroundColor Yellow
    exit 0
}

Write-Host "Installing frontend dependencies..."
Push-Location ../frontend
npm.cmd install

Write-Host "Creating .env file with API URL..."
Set-Content -Path .env -Value "VITE_API_URL=$apiUrl"

Write-Host "Building frontend..."
npm.cmd run build

$webBucketName = Read-Host "Enter WebBucketName (from SAM output)"
if (-not $webBucketName) {
    Write-Host "Skipping S3 upload because WebBucketName was not provided." -ForegroundColor Yellow
    Pop-Location
    exit 0
}

Write-Host "Uploading frontend to S3 bucket: $webBucketName"
aws s3 sync .\dist s3://$webBucketName --delete
Pop-Location
Write-Host "Frontend deployed to S3." -ForegroundColor Green
