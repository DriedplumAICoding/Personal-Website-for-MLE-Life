const form = document.querySelector(".subscribe-form");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email");
  const note = form.querySelector(".form-note");

  if (note && email) {
    note.textContent = `Thanks, ${email}. You are on the list.`;
  }
});
