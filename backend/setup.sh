#!/bin/bash
# Backend Setup Script - Exécutez une seule fois pour démarrer le backend

set -e

echo "🚀 Setting up Le Règne Millénaire Backend..."

# Check Node version
NODE_VERSION=$(node -v)
echo "✅ Node version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "⚠️  Please edit .env with your configuration"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env with your actual configuration"
echo "2. Run: npm run dev"
echo ""
echo "📖 Documentation:"
echo "- README.md - Full documentation"
echo "- RAILWAY_SETUP.md - Railway deployment"
echo "- FRONTEND_INTEGRATION.md - Frontend integration"
