# DermaScan Interview Guide Artifacts

This folder contains:

- `dermascan-interview-guide.md` — canonical editable source
- `generate_pdf.py` — deterministic PDF generator script
- `DermaScan-Architecture-and-Interview-Guide.pdf` — generated shareable document

## Generate / regenerate PDF

From repository root:

```bash
python -m pip install -r docs/interview-guide/requirements.txt
python docs/interview-guide/generate_pdf.py
```

Output path:

```text
docs/interview-guide/DermaScan-Architecture-and-Interview-Guide.pdf
```

## Notes

- Edit only the Markdown source for content updates.
- Re-run generation script after edits.
- The script renders headings, bullets, numbered lists, code blocks, and markdown tables, and adds page numbers.
