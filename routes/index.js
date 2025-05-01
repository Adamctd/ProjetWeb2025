export function get(request, response) {
    response.send(`
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
          <li><a href="connexion.html">Connexion</a></li>
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
              <!-- Ici sera injectée la liste des randonnées -->
            </tbody>
        </table>
      </main>
    </body>
</html>
    `);
  }