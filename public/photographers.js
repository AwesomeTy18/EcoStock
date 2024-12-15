// Event listener for the tabs in the photographer dashboard
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Hide all tabs
            tabs.forEach(tab => tab.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Show corresponding tab
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Handle image upload form submission
    const uploadForm = document.getElementById('upload-image-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);

            fetch('/api/photographers/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Image uploaded successfully and is pending approval.');
                    uploadForm.reset();
                } else {
                    alert('Error uploading image: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                alert('An error occurred while uploading the image.');
            });
        });
    }

    // Load the photographer's listings
    function loadMyListings() {
        fetch('/api/photographers/my-images')
            .then(response => response.json())
            .then(images => {
                const tableBody = document.getElementById('my-listings-table');
                tableBody.innerHTML = '';

                images.forEach(image => {
                    const row = document.createElement('tr');

                    const imageCell = document.createElement('td');
                    const img = document.createElement('img');
                    img.src = image.watermark_url;
                    img.alt = image.title;
                    img.width = 100;
                    imageCell.appendChild(img);
                    row.appendChild(imageCell);

                    const titleCell = document.createElement('td');
                    titleCell.textContent = image.title;
                    row.appendChild(titleCell);

                    const dateCell = document.createElement('td');
                    dateCell.textContent = new Date(image.created_at).toLocaleDateString();
                    row.appendChild(dateCell);

                    const statusCell = document.createElement('td');
                    statusCell.textContent = image.pending_approval ? 'Pending Approval' : 'Approved';
                    row.appendChild(statusCell);

                    const reviewsCell = document.createElement('td');
                    reviewsCell.textContent = 'N/A'; // You can update this to show actual reviews
                    row.appendChild(reviewsCell);

                    tableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error loading listings:', error);
            });
    }

    // Call loadMyListings when the "My Listings" tab is shown
    const myListingsTabButton = document.querySelector('.tab-button[data-tab="my-listings"]');
    if (myListingsTabButton) {
        myListingsTabButton.addEventListener('click', loadMyListings);
    }
});