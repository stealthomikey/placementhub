function updateCategoryInput(select) {
    const customInput = document.getElementById('customCategory');
    customInput.style.display = select.value === 'other' ? 'block' : 'none';
    if (select.value !== 'other') customInput.value = ''; // Clear input if not "Other"
}

function updateSubcategoryInput(select) {
    const customInput = document.getElementById('customSubcategory');
    customInput.style.display = select.value === 'other' ? 'block' : 'none';
    if (select.value !== 'other') customInput.value = ''; // Clear input if not "Other"
}