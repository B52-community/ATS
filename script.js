const greetBtn = document.getElementById('greetBtn');
const message = document.getElementById('message');

greetBtn.addEventListener('click', () => {
  message.textContent = 'Hello! Thanks for visiting your new simple website.';
});
