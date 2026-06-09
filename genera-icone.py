#!/usr/bin/env python3
"""
Script per generare icone PWA semplici
Richiede: pip install pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import sys
    
    def create_icon(size, filename):
        # Crea immagine con sfondo viola
        img = Image.new('RGB', (size, size), color='#8b5cf6')
        draw = ImageDraw.Draw(img)
        
        # Aggiungi testo "TB" al centro
        try:
            # Prova a usare un font di sistema
            font_size = int(size * 0.5)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
        except:
            # Fallback a font default
            font = ImageFont.load_default()
        
        text = "TB"
        
        # Calcola posizione centrata
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Disegna testo bianco
        draw.text((x, y), text, fill='white', font=font)
        
        # Salva immagine
        img.save(filename)
        print(f"✅ Creata: {filename}")
    
    # Genera le due icone
    create_icon(192, 'icon-192.png')
    create_icon(512, 'icon-512.png')
    
    print("\n🎉 Icone PWA generate con successo!")
    print("📁 File creati: icon-192.png, icon-512.png")
    
except ImportError:
    print("❌ Errore: Pillow non installato")
    print("\n📦 Installa con: pip install pillow")
    print("\nOppure usa uno dei metodi online descritti in GENERA_ICONE_PWA.md")
    sys.exit(1)

# Made with Bob
