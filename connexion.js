const form = document.querySelector("#sign-up-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(`bouton pressé`);
  
  const username = form.elements.username.value;
  const password = form.elements.password.value;
  const isNewUser = form.elements.checkbox.checked;
  console.log(username+" "+password+" "+isNewUser)

  // Nettoie les messages d'erreur
  form.querySelectorAll(".error").forEach((element) => {
    element.classList.remove("enabled");
  });

  if(isNewUser){
    fetch("/sign-up", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password}),
    })
      .then((response) => {
        console.log(`entré dans connexion.js`)
        if (response.ok) {
          location.href = "/";
        } else if (response.status === 409) {
          form.querySelector("#username-exists-error").classList.add("enabled");
        } else {
          form.querySelector("#sign-up-error").classList.add("enabled");
        }
      })
      .catch(() => {
        form.querySelector("#sign-up-error").classList.add("enabled");
      });
  }else{
    fetch("/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(async (response) => {
      form.querySelectorAll(".error").forEach((element) => {
        element.classList.remove("enabled");
      });
  
      if (response.ok) {
        location.href = "/";
      } else if (response.status === 401) {
        form.querySelector("#username-dont-exist-error").classList.add("enabled");
      } else {
        form.querySelector("#login-error").classList.add("enabled");
      }
    });
  }
});
