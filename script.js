const navigation = document.querySelector('.navigation');
const desktopNavigation = window.matchMedia('(min-width: 1001px)');
function syncNavigation() {
  navigation.open = desktopNavigation.matches;
}
syncNavigation();
desktopNavigation.addEventListener('change', syncNavigation);
navigation.addEventListener('click', (event) => {
  if (!desktopNavigation.matches && event.target.closest('a')) navigation.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.open && !desktopNavigation.matches) {
    navigation.open = false;
    navigation.querySelector('summary').focus();
  }
});
const form = document.querySelector('#contact-form');
const interests = [...form.querySelectorAll('[name="interest"]')];
function validateInterests() {
  interests[0].setCustomValidity(interests.some(input => input.checked) ? '' : 'Please choose at least one reason for connecting.');
}
interests.forEach(input => input.addEventListener('change', validateInterests));
validateInterests();
form.addEventListener('submit', (event) => {
  event.preventDefault();
  validateInterests();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = `Name: ${data.get('firstName')} ${data.get('lastName')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nI'm looking to: ${data.getAll('interest').join(', ')}\n\n${data.get('message')}`;
  window.location.href = `mailto:Cristina.BF@pm.me?subject=${encodeURIComponent('Connect & Get Involved')}&body=${encodeURIComponent(body)}`;
  document.querySelector('#form-status').textContent = 'Your email app has been requested. If it does not open, email Cristina.BF@pm.me directly. Your message has not been sent by this website.';
});
