#!/bin/bash

# Deployment script for Devis Generator
# Usage: ./deploy.sh "commit message"

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment process...${NC}"

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide a commit message${NC}"
    echo "Usage: ./deploy.sh \"your commit message\""
    exit 1
fi

COMMIT_MSG="$1"

# Run tests before deploying
echo -e "${BLUE}🧪 Running backend tests...${NC}"
cd api
source venv/bin/activate
pytest
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend tests failed! Aborting deployment.${NC}"
    exit 1
fi
cd ..

echo -e "${BLUE}🏗️  Building frontend...${NC}"
cd frontend
pnpm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed! Aborting deployment.${NC}"
    exit 1
fi
cd ..

# Git operations
echo -e "${BLUE}📦 Adding changes to git...${NC}"
git add .

echo -e "${BLUE}💾 Committing changes...${NC}"
git commit -m "$COMMIT_MSG"

echo -e "${BLUE}⬆️  Pushing to GitHub (main branch)...${NC}"
git push origin main

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Vercel will automatically deploy from main branch.${NC}"
echo -e "${BLUE}Check deployment status at: https://vercel.com${NC}"
