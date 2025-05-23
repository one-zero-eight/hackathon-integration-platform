from langchain_community.vectorstores import FAISS

from src.rag.indexer import load_faiss_index


class VectorRetriever:
    _index: FAISS | None = None

    @classmethod
    def init(cls, index_path: str) -> None:
        """
        Initialize the vector index by loading it from the specified path
        """
        cls._index = load_faiss_index(index_path)

    @classmethod
    def retrieve(cls, query: str, k: int = 25) -> str:
        """
        Retrieve the k most similar document snippets to the given query.
        """
        if cls._index is None:
            raise RuntimeError("Vector index not initialized. Call VectorRetriever.init() first.")
        docs_and_scores = cls._index.similarity_search_with_score(query, k=k)
        snippets = [doc.page_content for doc, _ in docs_and_scores]
        return "\n\n---\n\n".join(snippets)
