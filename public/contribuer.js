const form = document.querySelector("#contribuer-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("bouton pressé");

    const title = form.elements.title.value;
    const description = form.elements.description.value;
    const address = form.elements.address.value;
    const website = form.elements.website.value;
    const photo = form.elements.photo.value;
  
    form.querySelectorAll(".error").forEach((element) => {
      element.classList.remove("enabled");
    });

        fetch("/contrib", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, address, website, photo}),
        })
        .then((response) => {
            if (!response.ok) {
                console.log("Données reçues", { title, description, address, website, photo });
                res.status(500).end();
            }
            return response.json();
        })
        .then((data) => {
            const id = data.id;
            location.href = `/randonnee/${id}`;
        })
        .catch(() => {
          form.querySelector("#contribuer-error").classList.add("enabled");
        });
  });
  