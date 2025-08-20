#!/bin/bash

# Competition Setup Script for Nexus Hackathon Platform
echo "🚀 Setting up your competition-winning hackathon platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== STEP 1: Git Repository Setup ===${NC}"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Add all files
echo "Adding all files to git..."
git add .

# Commit changes
echo "Committing competition-ready platform..."
git commit -m "🏆 Competition-ready Nexus Hackathon Platform with AI features" || echo "No changes to commit"

echo -e "${GREEN}✅ Git repository prepared!${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo "1. Create GitHub repository at: https://github.com/new"
echo "   - Repository name: nexus-hackathon-platform"
echo "   - Description: AI-Powered Hackathon Platform - Competition Submission"
echo "   - Make it PUBLIC (so judges can review)"
echo ""
echo "2. Connect to GitHub (replace YOUR_USERNAME):"
echo "   git remote add origin https://github.com/YOUR_USERNAME/nexus-hackathon-platform.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo -e "${BLUE}=== STEP 2: Azure Resources Needed ===${NC}"
echo "Create these in Azure Portal:"
echo ""
echo "🔹 Resource Group: nexus-hackathon-rg"
echo "🔹 SQL Database: nexus-platform-db"
echo "🔹 App Service: nexus-hackathon-platform"
echo "🔹 AI Text Analytics: nexus-ai-text-analytics"
echo ""
echo "📖 Full guide available in: AZURE_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}🏆 Your platform is ready to win the competition!${NC}"