# Create the virtual environment
python -m venv .\documentai-backend\project-setup\venv

# Activate the virtual environment
. .\documentai-backend\project-setup\venv\Scripts\Activate.ps1

# Install necessary libraries
pip install -q --disable-pip-version-check colorama inquirer

# Add a separator
Write-Host "`n------------------------`n"

# Run the Python script
python .\documentai-backend\project-setup\gitpull-setup\setup_env.py

# Add a separator
Write-Host "`n------------------------`n"

# Ask the user if they want to install the dependencies
$install_deps = Read-Host -Prompt "Do you want to install the dependencies in requirements.txt to your local virtual environment? [y/n]"
if ($install_deps -eq "y") {
    Write-Host "Installing dependencies, this may take a while..." -NoNewline -ForegroundColor Yellow

    # Run the pip install command
    pip install -q --disable-pip-version-check -r .\documentai-backend\project-setup\requirements.txt

    Write-Host "`nDependencies installed." -ForegroundColor Green
}
else {
    Write-Host "Skipped installing dependencies." -ForegroundColor Red
}

# Add a separator
Write-Host "`n------------------------`n"

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
Write-Host "`n`nThe application is now running at http://localhost:8000" -ForegroundColor Green