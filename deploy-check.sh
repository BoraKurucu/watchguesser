#!/bin/bash

echo "🔍 Checking deployment readiness..."

# Check if images directory exists and has files
if [ ! -d "public/images" ]; then
    echo "❌ Error: public/images directory not found"
    exit 1
fi

image_count=$(find public/images -name "*.jpg" -o -name "*.png" | wc -l)
echo "📸 Found $image_count images in public/images/"

if [ $image_count -eq 0 ]; then
    echo "❌ Error: No images found in public/images/"
    exit 1
fi

# Check if placeholder exists
if [ ! -f "public/placeholder-watch.jpg" ]; then
    echo "❌ Error: placeholder-watch.jpg not found"
    exit 1
fi

echo "✅ All images ready for deployment"
echo "🚀 Proceeding with build and deployment..."

npm run build
echo "📦 Build complete. Ready to deploy!"
