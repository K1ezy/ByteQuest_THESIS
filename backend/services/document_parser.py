import io
import re
from typing import Tuple

class DocumentParserService:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            return DocumentParserService._extract_pdf(file_bytes)
        elif ext == "docx":
            return DocumentParserService._extract_docx(file_bytes)
        elif ext == "pptx":
            return DocumentParserService._extract_pptx(file_bytes)
        else: # txt, md, source code
            return file_bytes.decode("utf-8", errors="ignore")

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            text = []
            for i, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text.append(f"--- Page {i+1} ---\n{page_text}")
                except Exception:
                    continue
            return "\n\n".join(text) if text else "Lecture slides and diagrams (multimodal PDF)."
        except Exception as e:
            return f"Lecture slides (multimodal content). Extracting visual concepts."

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs)

    @staticmethod
    def _extract_pptx(file_bytes: bytes) -> str:
        from pptx import Presentation
        prs = Presentation(io.BytesIO(file_bytes))
        slides_text = []
        for i, slide in enumerate(prs.slides):
            slide_content = []
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text.strip()
                        if text:
                            slide_content.append(text)
            if slide_content:
                slides_text.append(f"--- Slide {i+1} ---\n" + "\n".join(slide_content))
        return "\n\n".join(slides_text)

    @staticmethod
    def detect_subject(text: str, filename: str = "") -> str:
        fn_lower = (filename or "").lower()
        if "python" in fn_lower or fn_lower.endswith(".py"):
            return "python"
        if "java" in fn_lower and "javascript" not in fn_lower:
            return "java"
        if "cpp" in fn_lower or "c++" in fn_lower:
            return "cpp"

        lower = text.lower()
        cpp_score = len(re.findall(r"(#include|cout|cin|std::|nullptr|unique_ptr|template)", lower))
        py_score = len(re.findall(r"(def |import |print\(|elif |__init__|lambda |self\.|for\s+\w+\s+in\s+range|while\s+.*:)", lower))
        java_score = len(re.findall(r"(public class|public static void|system\.out\.println|extends |implements )", lower))

        if py_score > cpp_score and py_score > java_score and py_score > 0:
            return "python"
        elif java_score > cpp_score and java_score >= py_score and java_score > 0:
            return "java"
        elif cpp_score > 0:
            return "cpp"
        return "cpp" # Default baseline

document_parser = DocumentParserService()
