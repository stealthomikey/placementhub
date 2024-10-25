function updateCategoryInput(select) {
    const customInput = document.getElementById('customCategory');
    if (select.value === 'other') {
        customInput.style.display = 'block';
        customInput.value = ''; // Clear the input if "Other" is selected
    } else {
        customInput.style.display = 'none';
    }
}

function updateSubcategoryInput(select) {
    const customInput = document.getElementById('customSubcategory');
    if (select.value === 'other') {
        customInput.style.display = 'block';
        customInput.value = ''; // Clear the input if "Other" is selected
    } else {
        customInput.style.display = 'none';
    }
}