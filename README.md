# PAST.AI: Preservation and Scanning Technology with Artificial Intelligence

Welcome to [Project Name]! This guide will help you set up the project on your local machine, specifically for Windows environments. Please follow the instructions carefully to ensure a smooth setup.

## Prerequisites

Before starting, make sure you meet the following requirements:

- **Operating System**: This setup is intended for Windows users only.
- **Visual Studio Code (VSCode)**: Ensure you have VSCode installed on your computer. If not, download and install it from [here](https://code.visualstudio.com/).
- **Docker**: You must have Docker installed and running on your machine. If you don't have Docker, download and install it from [Docker Hub](https://hub.docker.com/editions/community/docker-ce-desktop-windows).

## Setup Instructions

Here’s how to get the project up and running:

### Step 1: Open Visual Studio Code

Start by launching VSCode on your computer.

### Step 2: Clone the Repository

1. Use the "Clone Repository" option in the welcome page or the Source Control menu of VSCode (accessible by clicking the branch icon on the sidebar).
2. Click on "Clone Repository".
3. Paste the repository's URL (copy it from the GitHub page) into the textbox and confirm.
4. Select a directory to clone the repository into and allow the cloning process to complete.

### Step 3: Open the Project

Once cloning is complete, either click "Open" when prompted by VSCode or manually open the cloned repository folder through the “File” > “Open Folder” menu.

### Step 4: Run the Setup Command in PowerShell

With the project open in VSCode, switch to the integrated terminal by selecting View > Terminal or pressing `Ctrl+``. Ensure you are using PowerShell as your terminal (you can switch to PowerShell through the terminal dropdown menu in VSCode).

In the PowerShell terminal, execute the following command:

```powershell
./setup.ps1
```

Replace `your-setup-command-here` with the specific command that sets up your project. This might involve pulling Docker images, running Docker containers, or executing a script that prepares your project for use.

## Final Notes

You have successfully set up the project on your Windows machine. The project is ready for you to explore and contribute. If you encounter any issues, ensure all prerequisites are properly installed and that you're following the instructions for a Windows environment.
