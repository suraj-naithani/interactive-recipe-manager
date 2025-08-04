// public/scripts.js
document.addEventListener('DOMContentLoaded', () => {
  //Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  //Optional: Add more JavaScript for dynamic functionality as needed.  Example: AJAX calls
  //Example Fetch API call (replace with your actual API endpoint)
  // fetch('/api/data')
  //   .then(response => response.json())
  //   .then(data => {
  //     //Process the data and update the DOM accordingly
  //     console.log(data);
  //   })
  //   .catch(error => console.error('Error fetching data:', error));

});