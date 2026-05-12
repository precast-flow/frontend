import './style.css';

// Glass UI Components - Interactive functionality

// Update slider values on input
const sliders = document.querySelectorAll('.glass-slider');
for (const slider of sliders) {
  const sliderEl = slider as HTMLInputElement;
  const valueDisplay = sliderEl.parentElement?.querySelector('.slider-value');

  sliderEl.addEventListener('input', () => {
    if (valueDisplay) {
      valueDisplay.textContent = `${sliderEl.value}%`;
    }
  });
}

// Add subtle hover effect simulation (visual feedback)
const cards = document.querySelectorAll('.glass-card');
for (const card of cards) {
  card.addEventListener('mouseenter', () => {
    card.classList.add('hovered');
  });
  card.addEventListener('mouseleave', () => {
    card.classList.remove('hovered');
  });
}

console.log('Glass UI Components loaded');
