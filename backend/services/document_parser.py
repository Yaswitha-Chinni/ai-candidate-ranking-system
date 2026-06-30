import fitz  # PyMuPDF
import pdfplumber
import docx
import io
import logging

logger = logging.getLogger(__name__)

def parse_pdf(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}. Falling back to pdfplumber.")
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as fallback_e:
            logger.error(f"pdfplumber fallback failed: {fallback_e}")
            raise
    return text

def parse_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    except Exception as e:
        logger.error(f"Error parsing DOCX: {e}")
        raise

def parse_document(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    if ext == 'pdf':
        return parse_pdf(file_bytes)
    elif ext in ['doc', 'docx']:
        return parse_docx(file_bytes)
    elif ext == 'txt':
        return file_bytes.decode('utf-8', errors='ignore')
    else:
        raise ValueError(f"Unsupported file extension: {ext}")
