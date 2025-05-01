import express from "express";
import sqlite3 from "sqlite3";
import cookieSession from "cookie-session";
import { open } from "sqlite";
import { get as indexRoute } from "./routes/index.js";
import { postLogin as loginRoute } from "./routes/auth.js";
import { postSignup as signUpRoute } from "./routes/auth.js";
import { addRand as contribRoute } from "./routes/contribuer.js";

const port = 8080;
const databaseFile = './database.sqlite';

function start(database) {
    const app = express();

    app.use(express.static("public"));
    app.use(express.json());
    app.use(cookieSession({
        keys: ["cle"],
        maxAge: 1000 * 60 * 60,
    }));

    app.use((request, response, next) => {
        request.context = request.context ?? {};
        request.context.database = database;
        next();
    });
    app.use((request, response, next) => {
        console.log(`${request.method} ${request.url}`);
        next();
      });
    app.use((request, response, next) => {
        const username = request.session?.username;
        if (typeof username !== "string") {
          next();
          return;
        }
        request.context.database
          .prepare("SELECT username FROM users WHERE username = ?")
          .then((statement) => statement.get(request.session.username))
          .then((user) => {
            request.context = request.context ?? {};
            request.context.user = user;
            next();
          })
          .catch((error) => {
            console.error("Error loading user from session", error);
            request.session = null;
            next();
          });
    });
    
    app.get("/randonnees", async (req, res) => {
      try {
        const randonnees = await req.context.database.all("SELECT id, title, address, website, photo FROM randonnees");
        res.json(randonnees);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error.message);
        res.status(500).end();
      }
    });
    
    //route vers contribuer
    app.get("/contribuer", (req, res) => {
      if (req.session?.username) {
        res.send(`
          <html>
            <head>
              <title>Contribuer</title>
              <link rel="stylesheet" href="/shared.css">
              <script type="module" src="/contribuer.js"></script>
            </head>
            <body>
              <nav>
                <ul class="menu-bar">
                  <li><a href=".">Accueil</a></li>
                  <li><a href="/contribuer" class="actual">Contribuer</a></li>
                  <li>
                    <form method="POST" action="/logout">
                      <button type="submit">Se déconnecter</button>
                    </form>
                  </li>
                  <li id="utilisateur">Identifiant : ${req.session.username}</li>
                </ul>
              </nav>
              <main>
                <h1>Contribuer</h1>
                <form id="contribuer-form" method="POST" action="/ajouter-randonnee">
                  <p>
                    <label for="title">Nom de la randonnée*&nbsp;:</label>
                    <input id="title" type="text" name="title" required />
                  </p>
                  <p>
                    <label for="description">Description&nbsp;:</label>
                    <textarea id="description" name="description" rows="4" cols="50"></textarea>
                  </p>
                  <p>
                    <label for="address">Adresse de départ*&nbsp;:</label>
                    <input id="address" type="text" name="address" required />
                  </p>
                  <p>
                    <label for="photo">URL d'une photo&nbsp;:</label>
                    <input id="photo" type="url" name="photo" />
                  </p>
                  <p>
                    <label for="photo">Site internet&nbsp;:</label>
                    <input id="website" type="url" name="website" />
                  </p>
                  <button type="submit">Ajouter la randonnée</button>
                  <p id="contribuer-error" class="error">Erreur lors de l'ajoute à la base de données</p>
                </form>
                <p id="information">
                    Les items marqués d'une étoile (*) sont obligatoires.
                  </p>
              </main>
            </body>
          </html>
          `);
      } else {
        res.redirect("/connexion.html");
      }
    });
    //route vers index
    app.get("/", (req, res) => {
      if (req.session?.username) {
        res.send(`
      <html>
    <head>
      <title>
        Accueil
      </title>
      <link rel="stylesheet" href="/shared.css">
      <script type="module" src="/accueil.js" defer></script>
    </head>
    <body>
      <nav>
        <ul class="menu-bar">
          <li><a href="." class="actual">Accueil</a></li>
          <li><a href="/contribuer">Contribuer</a></li>
          <li><form method="POST" action="/logout">
                <button type="submit">Se déconnecter</button>
              </form>
          </li>
          <li id="utilisateur">Identifiant : ${req.session.username}</li>
        </ul>
      </nav>
      <main>
        <h1>Accueil</h1>
        <table>
            <thead>
              <tr>
                <th></th>
                <th>Nom</th>
                <th>Adresse de départ</th>
                <th>Lien</th>
              </tr>
            </thead>
            <tbody id="list">
              <!-- Ici sera injectée ta liste en JavaScript -->
            </tbody>
        </table>
      </main>
    </body>
</html>
    `);
      } else {
        indexRoute(req, res);
      }
    });
    //route vers randonnée
    app.get("/randonnee/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await req.context.database.get(
          "SELECT * FROM randonnees WHERE id = ?",
          id
        );
        if (!result) {
          res.status(404).send("Randonnée non trouvée");
          return;
        }
        if (req.session?.username) {
        res.send(`
          <html>
            <head>
              <title>${result.title}</title>
              <link rel="stylesheet" href="/shared.css">
              <script type="module" src="/randonnees.js" defer></script>
            </head>
            <body>
              <nav>
                <ul class="menu-bar">
                  <li><a href="/" class="actual">Accueil</a></li>
                  <li><a href="/contribuer">Contribuer</a></li>
                  <li><form method="POST" action="/logout">
                        <button type="submit">Se déconnecter</button>
                      </form>
                  </li>
                  <li id="utilisateur">Identifiant : ${req.session.username}</li>
                </ul>
              </nav>
              <main>
                <h1>${result.title}</h1>
                ${result.photo ? `<img src="${result.photo}" alt="photo de ${result.title}" style="max-width: 300px;">` : ""}
                ${result.description ? `<p>${result.description}</p>` : "<p>Aucune description fournie.</p>"}
                ${result.address ? `<p><strong>Adresse :</strong> ${result.address}</p>` : ""}
                ${result.website ? `<p><a href="${result.website}" target="_blank">Voir le site</a></p>` : ""}
                <div id="rating-stars">
                  <!-- 5 étoiles -->
                </div>
              </main>
            </body>
          </html>
        `);
      }else{
        res.send(`
          <html>
            <head>
              <title>${result.title}</title>
              <link rel="stylesheet" href="/shared.css">
              <script type="module" src="/randonnees.js" defer></script>
            </head>
            <body>
              <nav>
                <ul class="menu-bar">
                  <li><a href="/" class="actual">Accueil</a></li>
                  <li><a href="/contribuer">Contribuer</a></li>
                  <li><a href="connexion.html">Connexion</a></li>
                </ul>
              </nav>
              <main>
                <h1>${result.title}</h1>
                ${result.photo ? `<img src="${result.photo}" alt="photo de ${result.title}" style="max-width: 300px;">` : ""}
                ${result.description ? `<p>${result.description}</p>` : "<p>Aucune description fournie.</p>"}
                ${result.address ? `<p><strong>Adresse :</strong> ${result.address}</p>` : ""}
                ${result.website ? `<p><a href="${result.website}" target="_blank">Voir le site</a></p>` : ""}
                <div id="rating-stars">
                  <!-- 5 étoiles -->
                </div>
              </main>
            </body>
          </html>
        `);
      }
      } catch (err) {
        console.error(err);
        res.status(500).send("Erreur serveur.");
      }
    });

    
    app.post("/sign-up", express.json(), (req, res) => {
      signUpRoute(req, res);
    });
    
    app.post("/login", express.json(), (req, res) => {
      loginRoute(req, res);
    });
    
    app.post("/logout", (req, res) => {
        req.session = null; // supprimer la session
        res.redirect("/");  // page accueil
      });

      app.post("/contrib", (req, res) => {
        contribRoute(req,res);
      });

    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
    });
    
}

open({ filename: databaseFile, driver: sqlite3.Database })
  .then(start)
  .catch((error) => {
    console.error("Error opening database", error);
    process.exit(1);
  });