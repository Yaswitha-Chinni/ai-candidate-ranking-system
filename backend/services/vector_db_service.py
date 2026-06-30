import chromadb
from chromadb.config import Settings
import logging

logger = logging.getLogger(__name__)

class VectorDBService:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.collection_name = "candidates"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB initialized at {persist_directory}")
    
    def store_embeddings(self, ids: list[str], embeddings: list[list[float]], metadatas: list[dict], documents: list[str]):
        """Caches embeddings in ChromaDB to avoid regenerating."""
        logger.info(f"Storing {len(ids)} embeddings in ChromaDB.")
        # ChromaDB requires string values for metadata
        safe_metadatas = []
        for meta in metadatas:
            safe_meta = {k: str(v) if not isinstance(v, (str, int, float, bool)) else v for k, v in meta.items()}
            safe_metadatas.append(safe_meta)
            
        # ChromaDB max batch size is typically 5461 or similar. Chunk the inserts.
        batch_size = 5000
        for i in range(0, len(ids), batch_size):
            end_idx = i + batch_size
            self.collection.upsert(
                ids=ids[i:end_idx],
                embeddings=embeddings[i:end_idx],
                metadatas=safe_metadatas[i:end_idx],
                documents=documents[i:end_idx]
            )
        logger.info("Embeddings stored successfully.")
    
    def search(self, query_embedding: list[float], limit: int = 20):
        logger.info(f"Searching ChromaDB for top {limit} candidates.")
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=['metadatas', 'documents', 'distances']
        )
        return results
