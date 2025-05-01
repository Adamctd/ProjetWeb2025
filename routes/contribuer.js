function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

export async function addRand(req, res) {
    const { title, description, address, website, photo } = req.body;
  
    if (!isNonEmptyString(title) || !isNonEmptyString(address)) {
      res.status(400).end();
      return;
    }
  
    // Mise en place de valeurs par défaut si nécessaire
    const safeDescription = description || "";
    const safeWebsite = website || "";
    const safePhoto = photo || "";
  
    try {
      console.log("Préparation de la BDD...");
      const statement = await req.context.database.prepare(
        "INSERT INTO randonnees (title, description, address, website, photo) VALUES (?, ?, ?, ?, ?)"
      );
  
      console.log("BDD préparée, insertion en cours...");
      const result = await statement.run(title, safeDescription, address, safeWebsite, safePhoto);
  
      console.log("BDD remplie avec succès !");
      console.log("Résultat de l'insertion :", result); // Affiche tout le résultat
      const id = result.lastID;
      console.log("ID de la nouvelle randonnée : " + id);
  
      res.status(200).json({ id });
  
    } catch (error) {
      console.log("Erreur côté serveur :", error.message); // Affiche l'erreur
      res.status(500).end();
    }
  }
