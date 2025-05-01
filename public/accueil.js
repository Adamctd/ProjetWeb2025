window.addEventListener("DOMContentLoaded", () => {
    fetch("/randonnees")
      .then((response) => response.json())
      .then((randonnees) => {
        const tbody = document.querySelector("#list");

        randonnees.forEach((rando) => {
          const tr = document.createElement("tr");

          tr.innerHTML = `
            <td><img src="${rando.photo}" alt="" style="max-width: 60px;"></td>
            <td><a href="/randonnee/${rando.id}">${rando.title}</a></td>
            <td>${rando.address}</td>
            <td>${rando.website !== "" ? `<a href="${rando.website}" target="_blank">Lien</a>` : "Pas de lien"}</td>
          `;

          tbody.appendChild(tr);
        });
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des randonnées :", error);
      });
  });
