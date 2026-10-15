from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.rag import router as rag_router
from app.api.gis import router as gis_router
from app.api.analytics import router as analytics_router
from app.api.tts import router as tts_router
from app.api.odk import router as odk_router
from app.api.chat import router as chat_router

app = FastAPI(
    title="P5 Municipal Digital Twins — AI, GIS & Data Science Microservice",
    description="Python FastAPI service for RAG document question answering, satellite GIS processing, and predictive analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers under /api/v1
app.include_router(rag_router, prefix="/api/v1")
app.include_router(gis_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(tts_router, prefix="/api/v1")
app.include_router(odk_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {
        "service": "P5 Digital Twin AI & GIS Microservice",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "fastapi-ai-microservice"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
