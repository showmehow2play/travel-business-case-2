#!/usr/bin/env python3
"""
Generatore PDF dalle Guide Markdown
Converte tutti i file .md in PDF professionali
"""

import os
import sys
from pathlib import Path

try:
    from markdown import markdown
    from weasyprint import HTML, CSS
except ImportError:
    print("📦 Installazione dipendenze necessarie...")
    print("Esegui: pip3 install markdown weasyprint")
    sys.exit(1)

# Configurazione
GUIDES = [
    ('GUIDA_PUBBLICAZIONE.md', 'Guida Pubblicazione GitHub Pages'),
    ('GUIDA_DATABASE_ONLINE.md', 'Guida Database Online'),
    ('GUIDA_MIGRAZIONE_MODERNA.md', 'Guida Migrazione Mobile'),
    ('GUIDA_RAPIDA.md', 'Guida Rapida'),
    ('README.md', 'README')
]

# CSS per il PDF
PDF_CSS = """
@page {
    size: A4;
    margin: 2cm;
    @bottom-center {
        content: "Pagina " counter(page) " di " counter(pages);
        font-size: 10pt;
        color: #999;
    }
    @bottom-right {
        content: "Travel Business Case";
        font-size: 9pt;
        color: #999;
    }
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #667eea;
    font-size: 28pt;
    margin-top: 0;
    margin-bottom: 0.5em;
    border-bottom: 3px solid #667eea;
    padding-bottom: 0.3em;
}

h2 {
    color: #667eea;
    font-size: 20pt;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0.2em;
}

h3 {
    color: #764ba2;
    font-size: 16pt;
    margin-top: 1.2em;
    margin-bottom: 0.4em;
}

h4 {
    color: #555;
    font-size: 14pt;
    margin-top: 1em;
    margin-bottom: 0.3em;
}

code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: #d63384;
}

pre {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 5px;
    border-left: 4px solid #667eea;
    overflow-x: auto;
    font-size: 9pt;
}

pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}

blockquote {
    border-left: 4px solid #667eea;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
    font-style: italic;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    font-size: 10pt;
}

th {
    background-color: #667eea;
    color: white;
    padding: 0.5em;
    text-align: left;
    font-weight: bold;
}

td {
    border: 1px solid #ddd;
    padding: 0.5em;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

ul, ol {
    margin: 0.5em 0;
    padding-left: 2em;
}

li {
    margin: 0.3em 0;
}

a {
    color: #667eea;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.header {
    text-align: center;
    margin-bottom: 2em;
    padding-bottom: 1em;
    border-bottom: 2px solid #667eea;
}

.date {
    color: #999;
    font-size: 10pt;
    margin-top: 0.5em;
}

.footer {
    text-align: center;
    margin-top: 2em;
    padding-top: 1em;
    border-top: 1px solid #ddd;
    color: #999;
    font-size: 9pt;
}
"""

def generate_pdf(md_file, title):
    """Genera un PDF da un file Markdown"""
    
    print(f"📄 Generazione {title}...")
    
    # Leggi il file Markdown
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"❌ File {md_file} non trovato!")
        return False
    
    # Converti Markdown in HTML
    html_content = markdown(md_content, extensions=['tables', 'fenced_code', 'codehilite'])
    
    # Crea HTML completo
    from datetime import datetime
    current_date = datetime.now().strftime('%d/%m/%Y')
    
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body>
        <div class="header">
            <h1>{title}</h1>
            <div class="date">Generato il {current_date}</div>
        </div>
        
        {html_content}
        
        <div class="footer">
            Fatto con ❤️ da Bob | Travel Business Case
        </div>
    </body>
    </html>
    """
    
    # Genera PDF
    pdf_file = md_file.replace('.md', '.pdf')
    try:
        HTML(string=full_html).write_pdf(
            pdf_file,
            stylesheets=[CSS(string=PDF_CSS)]
        )
        print(f"✅ {pdf_file} creato con successo!")
        return True
    except Exception as e:
        print(f"❌ Errore nella generazione: {e}")
        return False

def main():
    """Funzione principale"""
    
    print("=" * 60)
    print("📚 GENERATORE PDF GUIDE")
    print("=" * 60)
    print()
    
    # Verifica di essere nella directory corretta
    if not os.path.exists('GUIDA_PUBBLICAZIONE.md'):
        print("❌ Errore: Esegui questo script dalla cartella travel-business-case")
        print("   cd travel-business-case")
        print("   python3 genera-pdf.py")
        sys.exit(1)
    
    # Genera tutti i PDF
    success_count = 0
    total_count = len(GUIDES)
    
    for md_file, title in GUIDES:
        if generate_pdf(md_file, title):
            success_count += 1
        print()
    
    # Riepilogo
    print("=" * 60)
    print(f"✅ Generati {success_count}/{total_count} PDF con successo!")
    print("=" * 60)
    print()
    print("📂 I PDF sono stati salvati nella cartella corrente:")
    for md_file, _ in GUIDES:
        pdf_file = md_file.replace('.md', '.pdf')
        if os.path.exists(pdf_file):
            size = os.path.getsize(pdf_file) / 1024  # KB
            print(f"   ✓ {pdf_file} ({size:.1f} KB)")
    print()

if __name__ == '__main__':
    main()

# Made with Bob
