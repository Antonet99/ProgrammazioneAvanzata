# Gestione di Modelli di Ottimizzazione su Grafo

[![Made with Node.js](https://img.shields.io/badge/Node.js->=12-blue?logo=node.js&logoColor=white)](https://nodejs.org "Go to Node.js homepage") [![Made with TypeScript](https://img.shields.io/badge/TypeScript-4-blue?logo=typescript&logoColor=white)](https://typescriptlang.org "Go to TypeScript homepage") [![Made with PostgreSQL](https://img.shields.io/badge/PostgreSQL-13-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/ "Go to PostgresSQL homepage") [![Made with Docker](https://img.shields.io/badge/Made_with-Docker-blue?logo=docker&logoColor=white)](https://www.docker.com/ "Go to Docker homepage")

Questo progetto verte sullo sviluppo di un back-end in Typescript, utilizzando Node.js, Express, Sequelize e PostgreSQL. L'obiettivo principale è quello di realizzare un sistema che consenta di gestire la creazione, la modifica e la valutazione di modelli di ottimizzazione su grafo, consentendo agli utenti autenticati di contribuire attivamente attraverso l'aggiornamento dei pesi degli archi.

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
- Ogni utente autenticato ha un numero di token memorizzato nel database, con un valore iniziale impostato durante il seeding del database e l'aggiunta manuale degli utenti.
- Se i token di un utente sono esauriti, ogni richiesta da parte dello stesso utente restituirà un errore 401 Unauthorized.
- È prevista una rotta per l'utente con ruolo admin per effettuare la ricarica dei token di un utente fornendo la mail e il nuovo credito.

## Architettura e Design Pattern

Il progetto segue un'architettura basata su Express.js per la gestione delle richieste HTTP e Sequelize come ORM per l'interazione con il database PostgreSQL.

Inoltre, sono stati inoltre utilizzati i seguenti design pattern:

### **Singleton**:

Il pattern Singleton, incluso nei Creational Design Patterns, garantisce l’unicità dell’istanza di una classe, rendendola disponibile a livello globale. Questo pattern è stato adottato per stabilire una connessione univoca con il database, assicurando l’uso coerente della stessa istanza. Nello specifico, l’implementazione del Singleton si trova nel file sequelize.ts.

### **Chain of Responsibility (CoR)**

Il pattern Chain of Responsibility (CoR), appartenente ai Behavioural Design Patterns, consente di gestire una richiesta eseguendo una serie di funzioni connesse in sequenza. In Express, il CoR si concretizza attraverso l’uso dei middleware, che fungono da anelli di una catena. Questo pattern è stato impiegato per selezionare le richieste HTTP, assicurando che solo quelle valide raggiungano il Controller; per ciascuna rotta è stata creata una catena di middleware che include:

- middleware per la verifica dell’header e del token JWT, se necessario;
- middleware specifici per la rotta, per il controllo di tipi, integrità dei dati e vincoli del database;
- middleware per la validazione dei vari payload e per il trattamento degli errori, che intervengono in caso di eccezioni negli anelli precedenti.
  La CoR è implementata nella cartella _middleware_.

### **Builder**

Il pattern Builder separa la costruzione di un oggetto complesso dalla sua rappresentazione, consentendo lo stesso processo di costruzione per creare diverse rappresentazioni. Nel caso specifico, il Builder è stato utilizzato per la costruzione dei grafi, elementi che nel nostro programma hanno diversi attributi: questa soluzione fornisce un’interfaccia per la costruzione dell’oggetto passo dopo passo, e può permettere di costruire l’oggetto in diverse varianti, senza che il codice cliente sia influenzato dai cambiamenti nella costruzione dell’oggetto stesso.

## Progettazione - UML

Di seguito vengono riportati i diagrammi UML:

- Use Case Diagram
- Sequence Diagram

![usecase](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/usecase.png)

![POSTcreateGraph](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/createGraph.png)
![GETallGraphs](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/GETallGraphs.png)
![POSTexecuteModel](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/POSTexecuteModel.png)
![POSTgetGraphRequests](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/POSTgetGraphRequests.png)
![POSTgraphPendingRequests](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/POSTgraphPendingRequests.png)
![POSTacceptDenyRequest](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/acceptDenyRequest.png)
![POSTrechargeTokens](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/POSTrechargeTokens.png)
![POSTgetMyPendingRequest](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/getMyPendingRequest.png)
![POSTsimulateModel](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/simulateModel.png)
![POSTupdateEdge](https://github.com/Antonet99/ProgrammazioneAvanzata/blob/main/resources/updateEdge.png)


## Esempi di Chiamate API

| TIPO | ROTTA                 | JWT |
| ---- | --------------------- | --- |
| POST | /createGraph          | Sì  |
| POST | /updateEdge           | Sì  |
| POST | /acceptDenyRequest        | Sì  |
| POST | /executeModel         | Sì  |
| POST | /rechargeTokens       | Sì  |
| POST | /getGraphRequests     | Sì  |
| POST | /graphPendingRequests | Sì  |
| POST | /getMyPendingRequest  | Sì  |
| POST | /simulateModel        | Sì  |
| GET  | /getAllGraph          | No  |

### - Creazione di un nuovo modello

**Rotta:** `POST /createGraph`

**Parametri query:**

- `graph`: grafo in formato JSON con la seguente struttura

Esempio di **payload:**

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

### - Aggiornamento dei pesi degli archi di un modello

**Rotta:** `POST /updateEdge`

**Parametri query:**

- `graph_id`: id del grafo da aggiornare
- `data`: lista degli archi di cui aggiornare il peso

Esempio di **payload:**

```json
{
  "graph_id": 2,
  "data": [
    { "start": "A", "end": "B", "weight": 7 },
    { "start": "C", "end": "D", "weight": 4 }
  ]
}
```

### - Approvazione o rifiuto delle richieste di aggiornamento

**Rotta:** `POST /acceptRequest`

**Parametri query:**

- `id_request`: lista di richieste relative al grafo che si vuole accettare/rifiutare
- `accepted`: valore booleano relativo alla richiesta che si vuole accettare/rifiutare

Esempio di **payload:**

```json
{
  "id_request": [1, 2],
  "accepted": [true, false]
}
```

### - Esecuzione dell'algoritmo di Dijkstra su un grafo

**Rotta:** `POST /executeModel`

**Parametri query:**

- `id_graph`: id del grafo sul quale si vuole applicare l'algoritmo
- `start`: nodo di partenza del grafo
- `goal`: nodo di arrivo del grafo

Esempio di **payload:**

```json
{
  "id_graph": 1,
  "start": "A",
  "goal": "D"
}
```

### - Ricarica dei token di un utente

La seguente rotta è disponibile solo per gli utenti di tipo **admin**

**Rotta:** `POST /rechargeTokens`

**Parametri query:**

- `username`: username dello user di cui si vogliono ricaricare i crediti
- `amount`: somma da ricaricare

Esempio di **payload:**

```json
{
  "username": "user1",
  "amount": 10
}
```

### - Recupero dello storico degli aggiornamenti di un modello

**Rotta:** `POST /getGraphRequests`

**Parametri query:**

- `startDate`: data di inizio (formato: DD-MM-YY HH:MM:SS) - opzionale
- `endDate`: data di fine (formato: DD-MM-YY) - opzionale
- `status`: stato degli aggiornamenti ("pending"/"accepted"/"denied") - opzionale

Esempio di **payload:**

```json
{
  "id_graph": 1,
  "status": "accepted",
  "startDate": "2023-05-18T10:30:00Z"
}
```

### - Recupero delle richieste di aggiornamento in sospeso per un grafo

**Rotta:** `POST /graphPendingRequests`

**Parametri query:**

- `id_graph`: id del grafo di cui si vogliono controllare le richieste

Esempio di **payload:**

```json
{
  "id_graph": 1
}
```

### - Simulazione di variazione del peso di un arco

**Rotta:** `POST /simulateModel`

**Parametri query:**

- `id_graph`: id del grafo di cui si vuole simulare l'applicazione dell'algoritmo di Dijkstra
- `options`: comprende `start` (il peso di partenza), `stop` (il peso di arrivo) e `step` (passo per aumentare il peso)
- `route`: percorso da seguire definito dai nodi `start` e `stop`
- `edge`: arco di cui modificare il peso definito da `node1` e `node2`

Esempio di **payload:**

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

### - Recupero di tutte le richieste di modifica per un utente proprietario di un modello

**Rotta:** `GET /getMyPendingRequest

Per questa rotta è necessaria soltanto l'autenticazione, ma non la specificazione di parametri all'interno del body

### - Recupero di tutti i grafi dal database

**Rotta:** `GET /getAllGraph`

Per questa rotta non è necessaria nè l'autenticazione nè la specificazione di parametri.

Questi sono gli esempi delle principali chiamate API disponibili nel sistema.

## Avvio del servizio

All'avvio del servizio tramite Docker, al fine di poter utilizzare l'app, il database verrà popolato con alcuni `user` (per maggiori info si rimanda al file `seed.sql`).

Prerequisiti:

- Ambiente Docker installato sulla propria macchina

Procedura di avvio:

- Posizionarsi nella cartella clonata dal seguente repository
- Creare, all'interno della root del progetto, un file ".env" con la seguente struttura:

```
DB_NAME=pa
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
TZ=Europe/Rome
API_PORT=3000
JWT_KEY="mysecretkey"
ALPHA=0.5
```

E' necessario sostituire il valore di "JWT_KEY" con la chiave con la quale verranno generati i token JWT.

- Effettuare la costruzione dell'immagine Docker della web app tramite il comando

```
$ docker build -t "nome_app" .
```

- Avviare il servizio Docker tramite il comando:

```
$ docker-compose up
```

- Eseguire le richieste sulla porta 3000 tramite cURL o Postman

## Test del progetto

Si può procedere con l’esecuzione di una serie di test già configurati importando, all'interno di Postman, la collection `postman_collection.json` che si trova nella directory principale del repository. I token JWT inclusi sono stati creati utilizzando la chiave ‘mysecretkey’.

## Note

### Software utilizzati

- [Visual Studio Code](https://code.visualstudio.com/) - IDE di sviluppo

- [Orbstack](https://orbstack.dev/) - Client Docker per la gestione di container

- [Postman](https://www.postman.com/) - piattaforma per il testing di API

### Autori

- Antonio Baio: [Github](https://github.com/giordanoangelini)
- Christian Parente: [Github](https://github.com/DiSilvestreCristian)
