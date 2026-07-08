# Condominio Awards

Webapp installabile sul cellulare per sorteggiare segretario e presidente di una riunione di condominio, con animazioni e audio generato dal browser.

🔗 **Demo online:** https://simmonsstummer.github.io/Condominio-Awards/

## Come usarla

1. Carica tutti i file su un piccolo hosting statico, anche Netlify, Vercel, GitHub Pages o un qualunque server HTTPS.
2. Apri la pagina dal cellulare.
3. Aggiungi alla schermata Home:
   - iPhone: Safari > Condividi > Aggiungi alla schermata Home.
   - Android/Chrome: menu ⋮ > Installa app o Aggiungi a schermata Home.
4. Dopo la prima apertura, la webapp resta disponibile offline grazie al service worker.

Nota: per installarla come PWA e usare bene l'offline serve normalmente aprirla almeno una volta da HTTPS o localhost. Aprire il file direttamente con `file://` può bloccare il service worker su molti browser.


## Audio

Gli effetti audio sono generati direttamente con Web Audio API: non ci sono file audio esterni, quindi la webapp resta leggera e funziona offline. Su alcuni telefoni l’audio può dipendere dalla modalità silenziosa del dispositivo o dai permessi del browser.

## Licenza

Distribuito sotto licenza [MIT](LICENSE). Puoi usarlo, modificarlo e ridistribuirlo liberamente, anche a scopo commerciale, mantenendo la nota di copyright.
