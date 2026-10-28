#!/usr/bin/env python3
"""Generate DermaScan interview guide PDF from markdown source.

Usage:
  python docs/interview-guide/generate_pdf.py
"""

from __future__ import annotations

import re
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Preformatted,
    Table,
    TableStyle,
    PageBreak,
)

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "dermascan-interview-guide.md"
OUTPUT = ROOT / "DermaScan-Architecture-and-Interview-Guide.pdf"


def page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(19.5 * cm, 1.2 * cm, f"Page {doc.page}")
    canvas.restoreState()


def parse_table(lines, idx):
    rows = []
    while idx < len(lines):
        line = lines[idx].rstrip("\n")
        if "|" not in line or not line.strip().startswith("|"):
            break
        rows.append([c.strip() for c in line.strip().strip("|").split("|")])
        idx += 1

    if len(rows) >= 2 and set(rows[1][0]) == {"-"}:
        rows.pop(1)

    return rows, idx


def markdown_to_story(text: str):
    styles = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=18, spaceAfter=10, leading=22)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=14, spaceAfter=8, leading=18)
    h3 = ParagraphStyle("h3", parent=styles["Heading3"], fontSize=12, spaceAfter=6, leading=16)
    body = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10.5, leading=14, spaceAfter=6)
    code = ParagraphStyle("code", parent=styles["Code"], fontSize=9, leading=12)

    lines = text.splitlines()
    story = []
    paragraph_buffer = []
    in_code = False
    code_lines = []

    def flush_paragraph():
        nonlocal paragraph_buffer
        if paragraph_buffer:
            text_block = " ".join(p.strip() for p in paragraph_buffer if p.strip())
            text_block = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text_block)
            text_block = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", text_block)
            story.append(Paragraph(text_block, body))
            paragraph_buffer = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            if in_code:
                story.append(Preformatted("\n".join(code_lines), code, dedent=0))
                story.append(Spacer(1, 0.2 * cm))
                code_lines = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("|") and "|" in stripped:
            flush_paragraph()
            rows, i = parse_table(lines, i)
            if rows:
                table = Table(rows, repeatRows=1)
                table.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                        ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 0), (-1, -1), 9),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 5),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ])
                )
                story.append(table)
                story.append(Spacer(1, 0.2 * cm))
            continue

        if stripped.startswith("# "):
            flush_paragraph()
            if story:
                story.append(PageBreak())
            story.append(Paragraph(stripped[2:], h1))
            i += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(stripped[3:], h2))
            i += 1
            continue

        if stripped.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(stripped[4:], h3))
            i += 1
            continue

        if re.match(r"^[-*] ", stripped):
            flush_paragraph()
            bullet_text = stripped[2:]
            bullet_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", bullet_text)
            bullet_text = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", bullet_text)
            story.append(Paragraph(f"• {bullet_text}", body))
            i += 1
            continue

        if re.match(r"^\d+\. ", stripped):
            flush_paragraph()
            story.append(Paragraph(stripped, body))
            i += 1
            continue

        if stripped == "---":
            flush_paragraph()
            story.append(Spacer(1, 0.2 * cm))
            i += 1
            continue

        if not stripped:
            flush_paragraph()
            story.append(Spacer(1, 0.12 * cm))
            i += 1
            continue

        paragraph_buffer.append(stripped)
        i += 1

    flush_paragraph()
    return story


def build_pdf() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(f"Source markdown not found: {SOURCE}")

    markdown = SOURCE.read_text(encoding="utf-8")
    story = markdown_to_story(markdown)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="DermaScan Project Architecture & Interview Preparation Guide",
        author="DermaScan Project",
    )
    doc.build(story, onFirstPage=page_number, onLaterPages=page_number)


if __name__ == "__main__":
    build_pdf()
    print(f"Generated: {OUTPUT}")
