function updateCategoryInput(selectElement) {
    const customInput = document.getElementById('customCategory');
    if (selectElement.value === 'other') {
        customInput.style.display = 'block';
        customInput.value = ''; // Clear the input if "Other" is selected
    } else {
        customInput.style.display = 'none';
    }
}

function updateSubcategoryInput(selectElement) {
    const customInput = document.getElementById('customSubcategory');
    if (selectElement.value === 'other') {
        customInput.style.display = 'block';
        customInput.value = ''; // Clear the input if "Other" is selected
    } else {
        customInput.style.display = 'none';
    }
}
