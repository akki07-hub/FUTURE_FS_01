// Select navigation elements.
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section[id]");
const contactForm = document.querySelector(".contact-form");

// Open and close the mobile navigation menu.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close the mobile menu after clicking a navigation link.
navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Highlight the active navigation link while scrolling.
window.addEventListener("scroll", () => {
  let currentSection = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 110;

    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute("id");
    }
  });

  navItems.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentSection}`);
  });
});

// Show a simple confirmation for the demo contact form.
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Thank you! Your message has been submitted.");
  contactForm.reset();
});
