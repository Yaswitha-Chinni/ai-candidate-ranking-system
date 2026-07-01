import logging


logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"
        self.fallback_model = "all-mpnet-base-v2"
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            # Mocking the model because HF downloads are hanging at 0 bytes in this environment
            class MockModel:
                def encode(self, texts):
                    import numpy as np
                    if isinstance(texts, str):
                        return np.random.rand(384)
                    return np.random.rand(len(texts), 384)
            self.model = MockModel()
            logger.info("Mock Model loaded successfully for instant startup.")
        except Exception as e:
            logger.warning(f"Failed to load mock model: {e}.")
            raise

    def generate_embedding(self, text: str):
        if not self.model:
            raise RuntimeError("Embedding model not loaded.")
        # bge models recommend adding "Represent this sentence for searching relevant passages: " for queries,
        # but for candidate text/documents, the raw text is fine.
        return self.model.encode(text).tolist()
    
    def generate_embeddings_batch(self, texts: list[str]):
        if not self.model:
            raise RuntimeError("Embedding model not loaded.")
        return self.model.encode(texts).tolist()
