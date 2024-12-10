
document.getElementById('upload-image-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });

    const result = await response.json();
    const statusDiv = document.getElementById('upload-status');
    if (result.success) {
        statusDiv.textContent = 'Image uploaded successfully.';
    } else {
        statusDiv.textContent = `Error: ${result.message}`;
    }
});