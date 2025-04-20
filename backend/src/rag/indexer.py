import os

import httpx
from langchain.embeddings.base import Embeddings
from langchain.schema import Document
from langchain_community.vectorstores import FAISS

from src.config import api_settings
from src.schemas.chat import Models

EMBEDDING_MODEL = Models.BGE_M3.value
MWS_GPT_API_EMBEDDING_ENDPOINT = api_settings.mws_gpt_api_url + "/v1/embeddings"


class MwsEmbeddings(Embeddings):
    """
    LangChain-compatible Embeddings that POSTs to the given endpoint. Uses MWS GPT API and BGE M3 model by default.
    """

    def __init__(
        self,
        api_key: str,
        endpoint: str = MWS_GPT_API_EMBEDDING_ENDPOINT,
        model: Models = Models.BGE_M3,
        max_batch_size: int = 10,
    ) -> None:
        self.api_key = api_key
        self.endpoint = endpoint
        self.model = model
        self.max_batch_size = max_batch_size

    def _post(self, inputs):
        payload = {"model": self.model.value, "input": inputs}
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        resp = httpx.post(self.endpoint, json=payload, headers=headers, timeout=60)
        resp.raise_for_status()
        return resp.json()["data"]

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        texts: a list of document‑chunks
        returns: list of embedding vectors
        Slice the full list of texts into smaller batches before sending.
        """
        all_embeddings: list[list[float]] = []
        for i in range(0, len(texts), self.max_batch_size):
            batch = texts[i : i + self.max_batch_size]
            data = self._post(batch)
            all_embeddings.extend(item["embedding"] for item in data)
        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        """
        text: a single query string
        returns: one embedding vector
        """
        data = self._post([text])
        return data[0]["embedding"]


def build_faiss_index(chunks: list[Document], index_path: str) -> None:
    """
    Build & persist a FAISS index using MWS embeddings API.
    """
    api_key = api_settings.mws_gpt_api_key.get_secret_value()
    embedder = MwsEmbeddings(api_key=api_key)

    index = FAISS.from_documents(chunks, embedder)

    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    index.save_local(index_path)


def load_faiss_index(index_path: str) -> FAISS:
    """
    Load a FAISS index (for retrieval) with the same MWS embedder.
    """
    api_key = api_settings.mws_gpt_api_key.get_secret_value()
    embedder = MwsEmbeddings(api_key=api_key)

    return FAISS.load_local(index_path, embedder, allow_dangerous_deserialization=True)
