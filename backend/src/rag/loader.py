from pathlib import Path

from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, UnstructuredWordDocumentLoader


def load_and_split(doc_path: str) -> list[Document]:
    """
    Load a .pdf or .docx file, split it into overlapping chunks,
    and return a list of LangChain Documents.
    """
    path = Path(doc_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        loader = PyPDFLoader(str(path))
    elif suffix in {".docx", ".doc"}:
        loader = UnstructuredWordDocumentLoader(str(path))
    else:
        raise ValueError(f"Unsupported document type: {suffix!r}. Only PDF and DOCX are supported.")

    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800, chunk_overlap=100, length_function=lambda txt: len(txt.split())
    )
    return splitter.split_documents(docs)
