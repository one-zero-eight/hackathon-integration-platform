from pathlib import Path

from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredMarkdownLoader,
    UnstructuredWordDocumentLoader,
)


def load_and_split(doc_path: str) -> list[Document]:
    """
    Load a .pdf, .docx or .md file, split it into overlapping chunks,
    and return a list of LangChain Documents.
    """
    path = Path(doc_path)
    suffix = path.suffix.lower()

    if suffix == ".md":
        loader = UnstructuredMarkdownLoader(str(path))
    elif suffix in {".docx", ".doc"}:
        loader = UnstructuredWordDocumentLoader(str(path))
    elif suffix == ".pdf":
        loader = PyPDFLoader(str(path))
    else:
        raise ValueError(f"Unsupported document type: {suffix!r}. Supported extensions: .pdf, .docx, .doc, .md")

    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=500,
        length_function=lambda txt: len(txt.split()),
    )
    return splitter.split_documents(docs)
