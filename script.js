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
// Web3Forms access keys are public form identifiers. Recipient settings live in Web3Forms.
const formStatus = document.querySelector('#form-status');
const submitButton = form.querySelector('[type="submit"]');
let submissionPending = false;
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submissionPending) return;
  validateInterests();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  // Preserve every selected checkbox; Object.fromEntries alone would keep only the last.
  const payload = Object.fromEntries(data);
  payload.interest = data.getAll('interest').join(', ');
  payload.name = `${data.get('firstName').trim()} ${data.get('lastName').trim()}`;
  payload.botcheck = Boolean(data.get('botcheck'));
  if (payload.botcheck) return;
  submissionPending = true;
  form.setAttribute('aria-busy', 'true');
  const controls = [...form.querySelectorAll('input, textarea, button')];
  const disabledStates = controls.map(control => control.disabled);
  controls.forEach(control => { control.disabled = true; });
  submitButton.textContent = 'Sending…';
  formStatus.textContent = 'Sending your message…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error('Submission was not accepted.');
    form.reset();
    validateInterests();
    formStatus.textContent = 'Thank you! Your message has been submitted.';
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

// Keep the mobile portrait section compact without duplicating the audio player.
const heroAudio = document.querySelector('.hero-audio');
const mobileAudioSlot = document.querySelector('.hero-audio-mobile-slot');
if (heroAudio && mobileAudioSlot) {
  const desktopAudioParent = heroAudio.parentElement;
  const mobileHero = window.matchMedia('(max-width: 700px)');
  function positionHeroAudio() {
    const target = mobileHero.matches ? mobileAudioSlot : desktopAudioParent;
    if (heroAudio.parentElement !== target) target.appendChild(heroAudio);
  }
  positionHeroAudio();
  mobileHero.addEventListener('change', positionHeroAudio);
}
