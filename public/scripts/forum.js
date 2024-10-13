document.addEventListener('DOMContentLoaded', () => {
    const overviewCards = document.querySelectorAll('.overviewcard');
    const forumSections = document.querySelectorAll('.forum-section');

    // Function to hide all forum sections
    function hideAllForums() {
      forumSections.forEach(section => {
        section.classList.remove('active');
      });
    }

    // Add click event listeners to all overview cards
    overviewCards.forEach(card => {
      card.addEventListener('click', function () {
        const forumToShow = this.getAttribute('data-forum') + '-forums';
        hideAllForums(); // Hide all forums
        document.querySelector(`.${forumToShow}`).classList.add('active'); // Show the clicked forum
      });
    });
});
