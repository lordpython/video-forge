#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Installing Node.js..."
    # For Ubuntu/Debian
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y nodejs npm
    # For Fedora/RHEL/CentOS
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y nodejs
    # For macOS (using Homebrew)
    elif command -v brew &> /dev/null; then
        brew install node
    else
        echo "Unable to install Node.js automatically. Please install it manually."
        exit 1
    fi
fi

# Enable corepack (comes with Node.js)
if ! command -v corepack &> /dev/null; then
    echo "Enabling corepack..."
    sudo npm install -g corepack
fi

# Create Python virtual environment and install requirements
echo "Setting up Python environment..."
python3 -m venv venv
source ./venv/bin/activate
pip install -r requirements.txt
