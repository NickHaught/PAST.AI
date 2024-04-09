# Install necessary libraries
pip install -q --disable-pip-version-check colorama inquirer

# Add a separator
Write-Host "`n------------------------`n"

# Run the Python script
python .\documentai-backend\project-setup\gitpull-setup\setup_env.py

# Add a separator
Write-Host "`n------------------------`n"

# Check if Node.js is installed
$node_installed = Get-Command node -ErrorAction SilentlyContinue
if (-not $node_installed) {
    $install_node = Read-Host -Prompt "Node.js is not installed. Do you want to install Node.js? [y/n]"
    if ($install_node -eq "y") {
        Write-Host "Installing Node.js, please wait..." -ForegroundColor Yellow
        # Run the Node.js installer
        # Add the code to install Node.js here
        Write-Host "Node.js installed." -ForegroundColor Green
    }
    else {
        Write-Host "Node.js is required for the frontend. Please install Node.js and run this script again." -ForegroundColor Red
        exit 1
    }
}

# Change the frontend port from :3000 to :8000
$frontend_port = ":3000"

# Check if Docker is installed
$docker_installed = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker_installed) {
    Write-Host "Docker is not installed. Please install Docker and run this script again." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info > $null
}
catch {
    Write-Host "Docker is not running. Please start Docker and press Enter to continue..." -ForegroundColor Yellow
    $null = Read-Host
}

# Build the Docker image
Write-Host "Building Docker image, this may take a while..." -ForegroundColor Yellow
docker-compose build > $null 2>&1

# Run the Docker container
Write-Host "Starting Docker container..." -ForegroundColor Yellow
docker-compose up -d > $null 2>&1

# Print the message to the user
Write-Host "`n`nThe application is now running at http://localhost$frontend_port" -ForegroundColor Green
