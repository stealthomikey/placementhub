
  document.addEventListener('DOMContentLoaded', function() {
    updateSubcategoryOptions(); // Set default subcategory options on page load
    
    // Add event listener to form submission
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
      const subcategorySelect = document.getElementById('subcategory');
      const customSubcategoryInput = document.getElementById('customSubcategory');

      // If "Other" is selected, replace the value of the subcategory with custom input
      if (subcategorySelect.value === 'Other' && customSubcategoryInput.value.trim() !== '') {
        // Create a new hidden input with the name 'subcategory' to override the select value
        const newSubcategoryInput = document.createElement('input');
        newSubcategoryInput.type = 'hidden';
        newSubcategoryInput.name = 'subcategory';
        newSubcategoryInput.value = customSubcategoryInput.value.trim();

        // Append the new input to the form so that it is submitted
        form.appendChild(newSubcategoryInput);
        
        // Disable the original subcategory select so it doesn't get submitted
        subcategorySelect.disabled = true;
      }
    });
  });

  function updateSubcategoryOptions() {
    const category = document.getElementById('category').value;
    const subcategory = document.getElementById('subcategory');
    const customSubcategory = document.getElementById('customSubcategory');
    
    // Clear existing subcategory options
    subcategory.innerHTML = '';
    customSubcategory.style.display = 'none';
    customSubcategory.value = '';

    let options = [];
    switch (category) {
      case 'NHSRegions':
        options = ['North West', 'North East', 'London', 'Midlands', 'South West', 'South East', 'Other'];
        break;
      case 'Degree':
        options = ['Computer Science', 'Engineering', 'Medicine', 'Business', 'Law', 'Other'];
        break;
      case 'Accommodation':
        options = ['Questions', 'Reviews', 'Other'];
        break;
      case 'Other':
        options = ['Questions', 'Feedback', 'Ideas', 'How to find placement', 'Other'];
        break;
    }

    // Populate the subcategory dropdown
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      subcategory.appendChild(opt);
    });
  }

  function updateSubcategoryInput(select) {
    const customInput = document.getElementById('customSubcategory');
    customInput.style.display = select.value === 'Other' ? 'block' : 'none';
    if (select.value !== 'Other') customInput.value = ''; // Clear input if not "Other"
  }
