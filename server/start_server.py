"""
Simple script to start the server on port 8000.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting server on port 8000...")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    ) 