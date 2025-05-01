// routes/auth.js

import { hashPassword, verifyPassword } from "../lib/hash-password.js";

// Vérifie si une chaîne est non vide
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

// Fonction d'inscription
export async function postSignup(req, res) {
  const { username, password } = req.body;
  console.log(`Entrée dans postSignup. Utilisateur : ${username}, Mot de passe : ${password ? "Présent" : "Absent"}`);

  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    console.log("Erreur : Nom d'utilisateur ou mot de passe vide.");
    res.status(400).end(); // Requête mal formée
    return;
  }

  try {
    console.log("Tentative de hachage du mot de passe...");
    const hashedPassword = await hashPassword(password);
    console.log("Mot de passe haché avec succès.");

    console.log("Préparation de la requête d'insertion dans la base de données...");
    const statement = await req.context.database.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    );
    await statement.run(username, hashedPassword);
    console.log(`Utilisateur ${username} ajouté à la base de données.`);

    req.session = req.session ?? {};
    req.session.username = username;
    console.log(`Session créée pour ${username}.`);

    res.status(200).end();
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error.message);
    if (error.message.includes("UNIQUE constraint failed")) {
      console.log("Conflit : L'utilisateur existe déjà.");
      res.status(409).end(); // Conflit : utilisateur déjà existant
    } else {
      res.status(500).end(); // Erreur serveur
    }
  }
}


// Fonction de connexion
export async function postLogin(req, res) {
  const { username, password } = req.body;

  try {
    const result = await req.context.database.get(
      "SELECT password FROM users WHERE username = ?",
      username
    );

    if (!result) {
      res.status(401).end(); // Utilisateur inconnu
      return;
    }

    const isValid = await verifyPassword(password, result.password);

    if (!isValid) {
      res.status(401).end(); // Mot de passe incorrect
      return;
    }

    req.session = req.session ?? {};
    req.session.username = username;

    res.status(200).end();
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).end(); // Erreur serveur
  }
}
