# 📄 Come Generare i PDF dalle Guide

Ci sono diversi metodi per convertire le guide Markdown in PDF. Ecco le opzioni dalla più semplice alla più avanzata.

---

## 🎯 Metodo 1: VS Code (CONSIGLIATO - Più Semplice)

### Prerequisiti
Installa l'estensione "Markdown PDF" in VS Code

### Passi:
1. Apri VS Code
2. Vai su Extensions (Cmd+Shift+X)
3. Cerca "Markdown PDF"
4. Installa l'estensione di yzane
5. Apri un file .md (es: GUIDA_PUBBLICAZIONE.md)
6. Premi Cmd+Shift+P (o F1)
7. Digita "Markdown PDF: Export (pdf)"
8. Premi Invio

✅ Il PDF verrà salvato nella stessa cartella del file .md!

### Per Tutti i File:
Ripeti per ogni guida:
- GUIDA_PUBBLICAZIONE.md
- GUIDA_DATABASE_ONLINE.md
- GUIDA_MIGRAZIONE_MODERNA.md
- GUIDA_RAPIDA.md
- README.md

---

## 🎯 Metodo 2: Servizio Online (Veloce)

### Opzione A: Dillinger.io
1. Vai su https://dillinger.io
2. Clicca su "Import from" → "File"
3. Seleziona il file .md
4. Clicca su "Export as" → "PDF"
5. Scarica il PDF

### Opzione B: Markdown to PDF
1. Vai su https://www.markdowntopdf.com
2. Trascina il file .md
3. Clicca "Convert"
4. Scarica il PDF

### Opzione C: CloudConvert
1. Vai su https://cloudconvert.com/md-to-pdf
2. Upload file .md
3. Clicca "Convert"
4. Scarica il PDF

---

## 🎯 Metodo 3: Pandoc (Professionale)

### Installazione Mac:
```bash
brew install pandoc
brew install basictex  # Per LaTeX (opzionale ma consigliato)
```

### Generazione PDF:
```bash
cd travel-business-case

# Singolo file
pandoc GUIDA_PUBBLICAZIONE.md -o GUIDA_PUBBLICAZIONE.pdf

# Tutti i file
for file in *.md; do
    pandoc "$file" -o "${file%.md}.pdf"
done
```

### Con Stile Personalizzato:
```bash
pandoc GUIDA_PUBBLICAZIONE.md \
    -o GUIDA_PUBBLICAZIONE.pdf \
    --pdf-engine=xelatex \
    -V geometry:margin=2cm \
    -V fontsize=11pt \
    -V colorlinks=true \
    -V linkcolor=blue
```

---

## 🎯 Metodo 4: Typora (App Desktop)

### Installazione:
1. Scarica Typora da https://typora.io
2. Installa l'app
3. Apri il file .md in Typora
4. File → Export → PDF
5. Salva il PDF

**Pro:** Interfaccia grafica, preview in tempo reale
**Contro:** App a pagamento ($14.99)

---

## 🎯 Metodo 5: Script Bash Automatico

Crea questo script per generare tutti i PDF con Pandoc:

```bash
#!/bin/bash
# genera-tutti-pdf.sh

echo "📚 Generazione PDF in corso..."

files=(
    "GUIDA_PUBBLICAZIONE.md"
    "GUIDA_DATABASE_ONLINE.md"
    "GUIDA_MIGRAZIONE_MODERNA.md"
    "GUIDA_RAPIDA.md"
    "README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        output="${file%.md}.pdf"
        echo "📄 Generazione $output..."
        pandoc "$file" -o "$output" \
            --pdf-engine=xelatex \
            -V geometry:margin=2cm \
            -V fontsize=11pt \
            -V colorlinks=true \
            -V linkcolor=blue
        echo "✅ $output creato!"
    else
        echo "❌ $file non trovato"
    fi
done

echo ""
echo "✅ Tutti i PDF sono stati generati!"
ls -lh *.pdf
```

Uso:
```bash
chmod +x genera-tutti-pdf.sh
./genera-tutti-pdf.sh
```

---

## 🎯 Metodo 6: Chrome/Safari (Manuale ma Funziona Sempre)

### Passi:
1. Apri il file .md in VS Code
2. Premi Cmd+Shift+V per vedere l'anteprima
3. Clicca con tasto destro sull'anteprima
4. Seleziona "Open in Browser" (o copia l'HTML)
5. Nel browser: File → Stampa (Cmd+P)
6. Destinazione: "Salva come PDF"
7. Clicca "Salva"

---

## 📊 Confronto Metodi

| Metodo | Difficoltà | Qualità | Tempo | Costo |
|--------|------------|---------|-------|-------|
| VS Code Extension | ⭐ | ⭐⭐⭐⭐ | 1 min/file | Gratis |
| Servizio Online | ⭐ | ⭐⭐⭐ | 2 min/file | Gratis |
| Pandoc | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 30 sec/file | Gratis |
| Typora | ⭐ | ⭐⭐⭐⭐⭐ | 1 min/file | $14.99 |
| Chrome Print | ⭐⭐ | ⭐⭐⭐ | 2 min/file | Gratis |

---

## 🚀 Raccomandazione

### Per Te (Mac User):
**Usa VS Code + Markdown PDF Extension**

1. Installa estensione (1 volta)
2. Apri file .md
3. Cmd+Shift+P → "Markdown PDF: Export (pdf)"
4. Fatto!

**Tempo totale: ~5 minuti per tutti i file**

---

## 💡 Configurazione VS Code Markdown PDF

Per PDF più belli, aggiungi in VS Code settings.json:

```json
{
    "markdown-pdf.format": "A4",
    "markdown-pdf.displayHeaderFooter": true,
    "markdown-pdf.headerTemplate": "<div style='font-size:9px; margin-left:1cm;'>Travel Business Case</div>",
    "markdown-pdf.footerTemplate": "<div style='font-size:9px; margin:0 auto;'>Pagina <span class='pageNumber'></span> di <span class='totalPages'></span></div>",
    "markdown-pdf.margin.top": "2cm",
    "markdown-pdf.margin.bottom": "2cm",
    "markdown-pdf.margin.left": "2cm",
    "markdown-pdf.margin.right": "2cm"
}
```

---

## ❓ Problemi Comuni

### "Pandoc non trovato"
```bash
# Installa Pandoc
brew install pandoc
```

### "LaTeX non trovato"
```bash
# Installa BasicTeX (più leggero)
brew install basictex

# Oppure MacTeX completo (più pesante)
brew install --cask mactex
```

### "Caratteri strani nel PDF"
Usa `--pdf-engine=xelatex` invece di default

### "Immagini non appaiono"
Assicurati che i percorsi delle immagini siano relativi

---

## 📚 Risorse

- **Markdown PDF Extension**: https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf
- **Pandoc**: https://pandoc.org
- **Typora**: https://typora.io
- **Dillinger**: https://dillinger.io

---

**Quale metodo preferisci? Ti consiglio VS Code + Markdown PDF! 🚀**