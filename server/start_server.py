"""
Simple script to start the server on port 8002.
"""

import uvicorn

if __name__ == "__main__":
    print("Starting server on port 8002...")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
    ) 