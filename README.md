# GoodKarma Dome Calculator

Prima versione statica e mobile-friendly del configuratore per cupole geodetiche.

## Cosa calcola

- Un modello a semisfera ottenuto dalla suddivisione ricorsiva di un icosaedro (F2/F3).
- Le lunghezze delle corde, raggruppate con una piccola tolleranza numerica.
- Una distinta preliminare dei montanti e il metraggio totale con un margine di 30 mm per pezzo.

## Limiti deliberati della v0.1

Il progetto **non** presenta angoli di troncatrice, bevel, miter, tagli compound, deduzioni ai nodi o quote strutturali come definitive. Tali dati dipendono dal dettaglio costruttivo GoodKarma, dal nodo, dalla sezione reale e dalla procedura di riferimento. Devono essere convalidati su modello 3D e su provino fisico prima del taglio in serie.

## Avvio locale

È un sito statico: aprire `index.html` con un server locale, ad esempio `python3 -m http.server 4173`.

## Deploy

Su Vercel importare il repository e selezionare **Other** come framework preset, senza build command e con `.` come output directory. La configurazione `vercel.json` non richiede variabili d'ambiente né backend.
