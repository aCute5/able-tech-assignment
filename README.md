# Able Tech Machines - Sistema di Gestione Macchine Industriali

Sistema web per la gestione e monitoraggio di macchine industriali sviluppato con Angular 18 e Angular Material.

## Tecnologie Utilizzate

**Frontend:**

- Angular 18.2.0
- Angular Material 20.1.0
- TypeScript 5.8.3
- SCSS per gli stili
- RxJS 7.8.2 per la gestione dello state

**Strumenti di Sviluppo:**

- Angular CLI 20.1.0
- Node.js 22.x (minimo richiesto: 20.19)
- npm per la gestione delle dipendenze

**Deployment:**

- Netlify per l'hosting
- Configurazione automatica del build

## Struttura del Progetto

```
able-tech-assignment/
├── src/
│   ├── app/
│   │   ├── components/          # Componenti principali
│   │   │   ├── dashboard/       # Dashboard con statistiche
│   │   │   ├── machines/        # Gestione macchine
│   │   │   └── customers/       # Gestione clienti
│   │   ├── models/              # Modelli TypeScript
│   │   │   ├── machine.model.ts
│   │   │   ├── customer.model.ts
│   │   │   └── dashboard.model.ts
│   │   ├── services/            # Servizi per le API
│   │   │   ├── machine.service.ts
│   │   │   ├── customer.service.ts
│   │   │   └── dashboard.service.ts
│   │   ├── app.config.ts        # Configurazione principale
│   │   ├── app.routes.ts        # Routing dell'applicazione
│   │   └── app.scss             # Stili globali
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/
│   ├── images/
│   └── favicon.ico
├── angular.json                 # Configurazione Angular
├── netlify.toml                 # Configurazione deploy
├── package.json
└── tsconfig.json
```

## Funzionalità

**Dashboard:**

- Visualizzazione statistiche generali
- Grafici di performance
- Indicatori di stato macchine

**Gestione Macchine:**

- Elenco completo delle macchine
- Creazione e modifica macchine
- Monitoraggio stato operativo
- Gestione anomalie
- Ricerca e filtri

**Gestione Clienti:**

- Anagrafica clienti
- Visualizzazione dettagli
- Associazione con macchine

## Caratteristiche Tecniche

**Architettura:**

- Applicazione Single Page Application (SPA)
- Routing lazy-loaded per ottimizzare le performance
- Componenti modulari riutilizzabili

**UI/UX:**

- Interfaccia responsive
- Dark theme applicato globalmente
- Modali per la gestione dei dati
- Sidebar di navigazione

**Gestione Dati:**

- Servizi dedicati per ogni entità
- Modelli TypeScript per type safety
- Gestione state reattiva con RxJS

## Installazione e Sviluppo

**Prerequisiti:**

- Node.js 20.19+ o 22.12+
- npm

**Installazione:**

```bash
npm install
```

**Sviluppo:**

```bash
npm start
```

L'applicazione sarà disponibile su `http://localhost:4200`

**Build:**

```bash
npm run build
```

I file compilati saranno in `dist/able-tech-machines/browser/`

## Deploy

Il progetto è configurato per il deploy automatico su Netlify:

- Build command: `npm run build`
- Publish directory: `dist/able-tech-machines/browser`
- Node.js version: 20

La configurazione è definita in `netlify.toml` con redirect per il routing Angular e ottimizzazioni per file statici.

## Struttura dei Componenti

**Machines Component:**

- Tabella responsive con dati macchine
- Form modale per creazione/modifica
- Gestione stati macchine
- Selezione icone personalizzate

**Customers Component:**

- Elenco clienti con dettagli
- Modal per visualizzazione informazioni
- Integrazione con sistema macchine

**Dashboard Component:**

- Cards con statistiche
- Griglia responsive
- Indicatori visivi di performance

## Configurazione

L'applicazione utilizza:

- Angular Material per i componenti UI
- Lazy loading per ottimizzare i bundle
- SCSS con variabili per il theming
- TypeScript strict mode per maggiore sicurezza

Il progetto è strutturato per essere scalabile e facilmente mantenibile, con separazione chiara tra logica business, presentazione e gestione dati.
