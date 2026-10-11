const navigation = document.querySelector('.navigation');
const desktopNavigation = window.matchMedia('(min-width: 1101px)');
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
// Paste the public Formspree endpoint here once the recipient is configured.
// Until configured, the existing email-app flow remains available.
const contactFormEndpoint = '';
const formStatus = document.querySelector('#form-status');
const submitButton = form.querySelector('[type="submit"]');
const directSubmissionEnabled = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(contactFormEndpoint);
let submissionPending = false;
if (directSubmissionEnabled) {
  form.action = contactFormEndpoint;
  form.method = 'POST';
  submitButton.textContent = 'Send message';
  form.querySelector('.form-note').textContent = 'Send your message directly to Cristina.';
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submissionPending) return;
  validateInterests();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  if (!directSubmissionEnabled) {
    const body = `Name: ${data.get('firstName')} ${data.get('lastName')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not provided'}\nI'm looking to: ${data.getAll('interest').join(', ')}\n\n${data.get('message')}`;
    window.location.href = `mailto:Cristina.BF@pm.me?subject=${encodeURIComponent('Connect & Get Involved')}&body=${encodeURIComponent(body)}`;
    formStatus.textContent = 'Your email app has been requested. If it does not open, email Cristina.BF@pm.me directly. Your message has not been sent by this website.';
    return;
  }
  data.set('_subject', 'Connect & Get Involved — Cristina’s campaign website');
  submissionPending = true;
  form.setAttribute('aria-busy', 'true');
  const controls = [...form.querySelectorAll('input, textarea, button')];
  const disabledStates = controls.map(control => control.disabled);
  controls.forEach(control => { control.disabled = true; });
  submitButton.textContent = 'Sending…';
  formStatus.textContent = 'Sending your message…';
  try {
    const response = await fetch(contactFormEndpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error('Submission was not accepted.');
    form.reset();
    validateInterests();
    formStatus.textContent = 'Thank you! Your message has been submitted to Cristina.';
  } catch (error) {
    formStatus.textContent = 'We could not confirm your submission. Your details are still here. Please try again or email Cristina.BF@pm.me directly.';
  } finally {
    controls.forEach((control, index) => { control.disabled = disabledStates[index]; });
    submitButton.textContent = 'Send message';
    form.removeAttribute('aria-busy');
    submissionPending = false;
  }
});

// Carry the selected way to help into the contact form.
document.querySelectorAll('[data-interest]').forEach(link => {
  link.addEventListener('click', () => {
    const interest = interests.find(input => input.value === link.dataset.interest);
    if (interest) {
      interest.checked = true;
      validateInterests();
    }
  });
});


const header = document.querySelector('.site-header');
let lastScrollPosition = Math.max(0, window.scrollY);
let scrollFramePending = false;
function updateHeaderVisibility() {
  const position = Math.max(0, window.scrollY);
  const difference = position - lastScrollPosition;
  const menuIsOpen = !desktopNavigation.matches && navigation.open;
  if (position <= header.offsetHeight || menuIsOpen || header.contains(document.activeElement)) {
    header.classList.remove('header-hidden');
    lastScrollPosition = position;
  } else if (Math.abs(difference) >= 8) {
    header.classList.toggle('header-hidden', difference > 0);
    lastScrollPosition = position;
  }
  scrollFramePending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollFramePending) {
    scrollFramePending = true;
    window.requestAnimationFrame(updateHeaderVisibility);
  }
}, { passive: true });
header.addEventListener('focusin', () => header.classList.remove('header-hidden'));
navigation.addEventListener('toggle', () => {
  if (!desktopNavigation.matches && navigation.open) header.classList.remove('header-hidden');
});


// Donation details open only from the Get Involved donation button.
const donationButton = document.querySelector('#donation-button');
const donationDialog = document.querySelector('#donation-dialog');
if (donationButton && donationDialog) {
  donationButton.addEventListener('click', () => donationDialog.showModal());
  donationDialog.addEventListener('click', event => {
    const bounds = donationDialog.getBoundingClientRect();
    if (event.target === donationDialog &&
        (event.clientX < bounds.left || event.clientX > bounds.right ||
         event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      donationDialog.close();
    }
  });
  donationDialog.addEventListener('close', () => donationButton.focus({ preventScroll: true }));
}
