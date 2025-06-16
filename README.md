# 🚗 Carrozzeria Motta Roberto - Sistema Gestionale

Sistema completo di gestione lavori e operatori per carrozzeria professionale.

## 🌟 Caratteristiche Principali

### 🔐 Sistema Multi-Utente
- **Manager**: Vista completa con controllo totale
- **Dipendenti**: Vista filtrata per reparto di appartenenza
- **Login sicuro** con ruoli differenziati

### 🏭 Gestione Reparti
- **5 Reparti specializzati**: Verniciatura, Lattoneria, Meccanica, Preparazione, Lavaggio
- **Operatori dedicati** per ogni reparto
- **Timer integrati** per tracking tempo lavoro
- **Dashboard visiva** con stato real-time

### 📋 Gestione Lavori Completa
- **Creazione lavori** con priorità e assegnazione
- **Stati dinamici**: Pending → In Progress → Completed
- **Modal dettagliato** per ogni lavoro
- **Filtri avanzati** per visualizzazione

### � Upload Foto
- **Caricamento multiplo** di foto per ogni lavoro
- **Visualizzazione griglia** responsive
- **Modal fullscreen** per dettagli
- **Persistenza** in localStorage

### 🔧 Gestione Ricambi
- **Database ricambi** per ogni lavoro
- **Calcolo automatico** costi totali
- **Form completo**: nome, codice, quantità, prezzo
- **Modifica/eliminazione** ricambi

### 📊 Dashboard e Report
- **Statistiche real-time** lavori urgenti/attivi/completati
- **Indicatori visivi** per foto e ricambi
- **Report performance** per reparti
- **Vista calendario** lavori

## 🚀 Deploy su Render

### Preparazione
1. **Fork/Clone** questo repository
2. **Commit** tutte le modifiche
3. **Push** su GitHub

### Deploy Automatico
1. Vai su [Render.com](https://render.com)
2. Connetti il tuo repository GitHub
3. Configura il servizio:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Port**: Automatico (dalla variabile PORT)

## 🛠️ Installazione Locale

### Prerequisiti
- Node.js 14+
- npm o yarn

### Setup
```bash
# Clone repository
git clone https://github.com/your-username/carrozzeria-motta-roberto.git
cd carrozzeria-motta-roberto

# Installa dipendenze
npm install

# Avvia server di sviluppo
npm start

# Apri browser
http://localhost:3000
```

## 🔐 Credenziali di Accesso

### Amministratore (Roberto)
- **Username:** `admin`
- **Password:** `admin123`
- **Permessi:** Completi (caricare, modificare, eliminare lavori, gestire utenti)

### Dipendenti
- **Username:** `dipendente1` | **Password:** `dip123` | **Nome:** Mario Rossi
- **Username:** `dipendente2` | **Password:** `dip123` | **Nome:** Luigi Verdi
- **Permessi:** Visualizzare lavori e aggiornare stati

## 📱 Funzionalità Principali

### 🎯 Dashboard Centralizzata
- Visualizzazione di tutti i lavori in corso
- Filtri per reparto, stato, priorità e scadenza
- Colori distintivi per priorità e urgenze
- Notifiche visive per lavori prossimi alla scadenza

### 📝 Gestione Lavori
- **Caricamento nuovo lavoro** (solo amministratore)
- **Aggiornamento stato** (tutti gli utenti)
- **Eliminazione lavoro** (solo amministratore)

### 🏭 Reparti Gestiti
- **Carrozzeria** - Riparazioni carrozzeria
- **Revisione** - Controlli periodici
- **Meccanica** - Interventi meccanici
- **Lavaggio-CarService** - Servizi di pulizia
- **Leva Bolli** - Pratiche burocratiche

### 📊 Sistema Priorità
- **🔴 Alta** - Urgente (colore rosso)
- **🟡 Media** - Normale (colore giallo)
- **🟢 Bassa** - Non urgente (colore verde)

### 📈 Stati Lavoro
- **In attesa** - Lavoro non ancora iniziato
- **Iniziato** - Lavoro in corso
- **Finito** - Lavoro completato

## 🎨 Caratteristiche Tecniche

### 📱 Design Responsive
- Ottimizzato per PC, tablet e smartphone
- Interface adattiva per tutti i dispositivi
- Navigazione touch-friendly

### 🔒 Sicurezza
- Sistema di autenticazione utenti
- Permessi differenziati per ruoli
- Salvataggio automatico dei dati

### 💾 Gestione Dati
- Salvataggio automatico nel browser (localStorage)
- Backup automatico ogni 30 secondi
- Dati persistenti tra le sessioni

## 📋 Guida Utilizzo

### Per l'Amministratore (Roberto)
1. **Login** con credenziali admin
2. **Dashboard** - Visualizza tutti i lavori
3. **Nuovo Lavoro** - Aggiungi nuovi lavori
4. **Gestione** - Modifica/elimina lavori esistenti
5. **Report** - Visualizza statistiche
6. **Storico** - Consulta lavori completati

### Per i Dipendenti
1. **Login** con credenziali dipendente
2. **Dashboard** - Visualizza lavori assegnati
3. **Aggiorna Stato** - Cambia stato dei lavori
4. **Storico** - Consulta lavori completati

## 🎯 Vantaggi del Sistema

✅ **Zero comunicazioni verbali** - Tutto visibile in tempo reale
✅ **Organizzazione centralizzata** - Una dashboard per tutti
✅ **Gestione priorità** - Sistema di urgenze chiaro
✅ **Controllo scadenze** - Notifiche automatiche
✅ **Accesso mobile** - Utilizzabile da smartphone
✅ **Storico completo** - Archivio di tutti i lavori
✅ **Filtri avanzati** - Ricerca rapida e precisa

## 🔧 Personalizzazioni Possibili

- Aggiunta nuovi reparti
- Modifica credenziali utenti
- Personalizzazione colori e layout
- Aggiunta campi personalizzati
- Integrazione con sistemi esterni

## 📞 Supporto

Per assistenza tecnica o modifiche al sistema, contattare il team di sviluppo.

---

**Carrozzeria Motta Roberto** - Sistema Gestionale v1.0
*Sviluppato per ottimizzare l'organizzazione e la produttività*