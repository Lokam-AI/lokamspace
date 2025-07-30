#!/usr/bin/env bash

# Frontend Integration Test Script
echo "🚀 Testing Frontend Metrics Integration"
echo "======================================="

# Check if client directory exists
if [ ! -d "client" ]; then
    echo "❌ Client directory not found. Please run from lokamspace root."
    exit 1
fi

cd client

echo "📦 Installing dependencies..."
npm install --silent

echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "🎯 Checking lint errors..."
npm run lint --silent

if [ $? -eq 0 ]; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting warnings found (not blocking)"
fi

echo "🏗️  Testing build process..."
npm run build:dev --silent

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 Frontend integration tests completed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Start the backend server: cd ../server && uvicorn app.main:app --reload"
echo "2. Start the frontend dev server: npm run dev"
echo "3. Navigate to the Metrics page to see real-time data"
echo "4. Test different date ranges using the date picker"
