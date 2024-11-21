document.addEventListener('DOMContentLoaded', function() {
    updateSubcategoryOptions(); // Set default subcategory options on page load
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
            customSubcategory.style.display = 'block';
            break;
        default:
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
