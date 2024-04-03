# Gestione di Modelli di Ottimizzazione su Grafo

Questo progetto è un back-end sviluppato in Typescript utilizzando Node.js, Express, Sequelize e PostgreSQL. L'obiettivo principale è quello di realizzare un sistema che consenta di gestire la creazione, la modifica e la valutazione di modelli di ottimizzazione su grafo, consentendo agli utenti autenticati di contribuire attivamente attraverso l'aggiornamento dei pesi degli archi.

## Funzionalità principali

- Creazione di un nuovo modello di grafo con validazione della richiesta e addebito di token in base al numero di nodi e archi.
- Aggiornamento dei pesi degli archi di un modello esistente da parte dell'utente creatore o di altri utenti, con approvazione richiesta per questi ultimi.
- Approvazione o rifiuto delle richieste di aggiornamento (provenienti da altri utenti) dei pesi degli archi da parte dell'utente creatore del modello.
- Visualizzazione dello storico degli aggiornamenti effettuati su un modello, con filtri per data e stato (accettato/rifiutato).
- Verifica dello stato di un modello, ovvero se ci sono richieste di aggiornamento in sospeso.
- Visualizzazione delle richieste di aggiornamento in sospeso relative ai modelli creati dall'utente autenticato.
- Esecuzione di un modello fornendo un nodo di partenza e uno di arrivo, con addebito di token e restituzione del percorso ottimale e del costo associato.
- Esportazione dello storico degli aggiornamenti dei pesi di un modello in formato JSON con filtri per data.
- Simulazione di esecuzione di un modello con variazione del peso di un arco specificando valore di inizio, fine e passo di incremento, con restituzione dei risultati e del miglior risultato con la configurazione dei pesi utilizzati.

## Autenticazione e Autorizzazione

- Tutte le chiamate API richiedono l'autenticazione tramite token JWT (JSON Web Token).
- Ogni utente autenticato ha un numero di token memorizzato nel database, con un valore iniziale impostato durante il seeding del database.
- Se i token di un utente sono esauriti, ogni richiesta da parte dello stesso utente restituirà un errore 401 Unauthorized.
- È prevista una rotta per l'utente con ruolo admin per effettuare la ricarica dei token di un utente fornendo la mail e il nuovo credito.

## Architettura e Design Pattern

Il progetto segue un'architettura basata su Express.js per la gestione delle richieste HTTP e Sequelize come ORM per l'interazione con il database PostgreSQL.

Sono stati inoltre utilizzati i seguenti design pattern:

- **Singleton**: per garantire una singola istanza della connessione al database.
- **Repository**: per separare la logica di accesso ai dati dal resto dell'applicazione.
- **Middleware**: per gestire l'autenticazione, l'autorizzazione e la gestione degli errori in modo modulare.
- **Builder**: per la creazione dei grafi

## Avvio del Progetto

Per avviare il progetto, seguire questi passaggi:

1. Clonare il repository: `git clone <URL_REPOSITORY>`
2. Installare le dipendenze: `npm install`
3. Configurare le variabili d'ambiente nel file `.env` (vedere `.env.example` per un esempio)
4. Eseguire le migrazioni del database: `npm run migrate`
5. Eseguire il seeding del database: `npm run seed`
6. Avviare il server: `npm start`

In alternativa, è possibile avviare il progetto utilizzando Docker Compose:

1. Assicurarsi di avere Docker e Docker Compose installati
2. Clonare il repository: `git clone <URL_REPOSITORY>`
3. Configurare le variabili d'ambiente nel file `.env` (vedere `.env.example` per un esempio)
4. Eseguire il comando: `docker-compose up`

## Esempi di Chiamate API

### Creazione di un nuovo modello

- **Rotta:** `POST /createGraph`
- Esempio di **payload:**
  ```json
  {
    "graph": {
      "A": { "B": 5, "C": 2 },
      "B": { "A": 5, "C": 1, "D": 3 },
      "C": { "A": 2, "B": 1, "D": 6 },
      "D": { "B": 3, "C": 6 }
    }
  }
  ```
- **Risposta:**
  ```json
  {
    "message": "Modello creato con successo"
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

### Aggiornamento dei pesi degli archi di un modello

- **Rotta:** `PUT /updateEdge`
- **Payload:**
  ```json
  {
    "graph_id": 2,
    "data": [
      { "start": "A", "end": "B", "weight": 7 },
      { "start": "C", "end": "D", "weight": 4 }
    ]
  }
  ```
- **Risposta:**
  ```json
  {
    "message": "Richiesta di aggiornamento inviata con successo"
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

### Approvazione o rifiuto delle richieste di aggiornamento

- **Rotta:** `POST /acceptRequest`
- **Payload:**
  ```json
  {
    "id_request": [1, 2],
    "accepted": [true, false]
  }
  ```
- **Risposta:**
  ```json
  {
    "message": "Richiesta di aggiornamento approvata"
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization` (solo per l'utente creatore del modello)

### Esecuzione di un modello

- **Rotta:** `POST /executeModel`
- **Payload:**
  ```json
  {
    "id_graph": 1,
    "start": "A",
    "goal": "D"
  }
  ```
- **Risposta:**
  ```json
  {
    "path": ["A", "B", "D"],
    "cost": 8,
    "executionTime": 0.023
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

### Ricarica dei token di un utente

La seguent rotta è disponibile solo per gli utenti di tipo **admin**

- **Rotta:** `POST /rechargeTokens`
- **Payload:**
  ```json
  {
    "username": "user1",
    "amount": 10
  }
  ```
- **Risposta:**
  ```json
  {
    "message": "Token ricaricati con successo"
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization` (solo per utenti con ruolo admin)

### Recupero dello storico degli aggiornamenti di un modello

- **Rotta:** `POST /getGraphRequests`
- **Parametri query:**
  - `startDate`: Data di inizio (formato: DD-MM-YY HH:MM:SS)
  - `endDate`: Data di fine (formato: DD-MM-YY)
  - `status`: Stato degli aggiornamenti ("pending"/"acceptede"/"denied")
- **Risposta:**
  ```json
  {
    "id_graph": 1,
    "status": "accepted",
    "startDate": "2023-05-18T10:30:00Z"
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

### Recupero delle richieste di aggiornamento in sospeso per l'utente autenticato

- **Rotta:** `POST /graphPendingRequests`
- **Risposta:**
  ```json
  {
    "id_graph": 1
  }
  ```
- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

### Simulazione di variazione del peso di un arco

- **Rotta:** `POST /simulateModel`
- **Payload:**
  ```json
  {
    "id_graph": 1,
    "options":  {
      "start": 1,
      "stop": 2,
      "step": 0.1
      }
    "route":  {
      "start": "A",
      "goal": "D"
      }
  "edge":  {
  	"node1": "A",
  	"node2": "B",
  	}
  }
  ```
- **Risposta:**

  ```json

  ```

- **Autenticazione richiesta:** Sì, token JWT nell'header `Authorization`

Questi sono esempi delle principali chiamate API disponibili nel sistema di gestione dei modelli di ottimizzazione su grafo.
