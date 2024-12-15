// Check if the upload image form exists before adding an event listener
const uploadImageForm = document.getElementById('upload-image-form');
if (uploadImageForm) {
    uploadImageForm.addEventListener('submit', async (e) => {
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
        if (statusDiv) {
            if (result.success) {
                statusDiv.textContent = 'Image uploaded successfully.';
            } else {
                statusDiv.textContent = `Error: ${result.message}`;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if the photographer requests table exists before manipulating it
    const tableBody = document.getElementById('photographer-requests-table');
    if (tableBody) {
        // Load pending photographer applications
        fetch('/api/users/pending-photographers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Failed to fetch pending photographers');
            }
        })
        .then(pendingPhotographers => {
            tableBody.innerHTML = ''; 
            pendingPhotographers.forEach(photographer => {
                const row = document.createElement('tr');
    
                const idCell = document.createElement('td');
                idCell.textContent = photographer.user_id;
                row.appendChild(idCell);
    
                const nameCell = document.createElement('td');
                nameCell.textContent = photographer.photographer_full_name;
                row.appendChild(nameCell);
    
                const emailCell = document.createElement('td');
                emailCell.textContent = photographer.email;
                row.appendChild(emailCell);
    
                const portfolioCell = document.createElement('td');
                const portfolioLink = document.createElement('a');
                portfolioLink.href = photographer.photographer_portfolio_url;
                portfolioLink.target = '_blank';
                portfolioLink.textContent = 'View Portfolio';
                portfolioCell.appendChild(portfolioLink);
                row.appendChild(portfolioCell);
    
                const actionCell = document.createElement('td');
    
                const approveButton = document.createElement('button');
                approveButton.className = 'btn btn-approve approve-btn';
                approveButton.textContent = 'Approve';
                approveButton.addEventListener('click', () => {
                    approvePhotographer(photographer.user_id, row);
                });
                actionCell.appendChild(approveButton);
    
                const rejectButton = document.createElement('button');
                rejectButton.className = 'btn btn-danger reject-btn';
                rejectButton.textContent = 'Reject';
                rejectButton.addEventListener('click', () => {
                    rejectPhotographer(photographer.user_id, row);
                });
                actionCell.appendChild(rejectButton);
    
                row.appendChild(actionCell);
    
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading pending photographers:', error);
        });
    }

    // Load pending image requests
    const imageRequestsTableBody = document.getElementById('image-requests-table');
    if (imageRequestsTableBody) {
        fetch('/api/admin/pending-images', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(pendingImages => {
            imageRequestsTableBody.innerHTML = '';
            pendingImages.forEach(image => {
                const row = document.createElement('tr');

                const imageCell = document.createElement('td');
                const img = document.createElement('img');
                img.src = image.watermark_url;
                img.alt = image.title;
                img.width = 100;
                imageCell.appendChild(img);
                row.appendChild(imageCell);

                const photographerCell = document.createElement('td');
                
                // Fetch photographer's name using photographer_id
                fetch(`/api/users/${image.photographer_id}`)
                    .then(response => response.json())
                    .then(user => {
                        photographerCell.textContent = user.name;
                    })
                    .catch(error => {
                        console.error('Error fetching photographer name:', error);
                        photographerCell.textContent = 'Unknown';
                    });

                row.appendChild(photographerCell);

                const titleCell = document.createElement('td');
                titleCell.textContent = image.title;
                row.appendChild(titleCell);

                const descriptionCell = document.createElement('td');
                descriptionCell.textContent = image.description;
                row.appendChild(descriptionCell);

                const priceCell = document.createElement('td');
                priceCell.textContent = image.price;
                row.appendChild(priceCell);

                const locationCell = document.createElement('td');
                locationCell.textContent = image.location;
                row.appendChild(locationCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = image.date_taken;
                row.appendChild(dateCell);

                const dateRequested = document.createElement('td');
                dateRequested.textContent = image.created_at.split('T')[0];
                row.appendChild(dateRequested);

                const actionCell = document.createElement('td');

                const approveButton = document.createElement('button');
                approveButton.className = 'btn btn-approve approve-image-btn';
                approveButton.textContent = 'Approve';
                approveButton.addEventListener('click', () => {
                    approveImage(image.photo_id, row);
                });
                actionCell.appendChild(approveButton);

                const denyButton = document.createElement('button');
                denyButton.className = 'btn btn-danger deny-image-btn';
                denyButton.textContent = 'Deny';
                denyButton.addEventListener('click', () => {
                    denyImage(image.photo_id, row);
                });
                actionCell.appendChild(denyButton);

                row.appendChild(actionCell);
                imageRequestsTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error loading pending images:', error);
        });
    }
});

function approvePhotographer(user_id, tableRow) {
    fetch('/api/users/approve-photographer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Photographer ID ${user_id} approved.`);
            tableRow.remove();
        } else {
            alert(`Failed to approve photographer: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error approving photographer:', error);
    });
}

function rejectPhotographer(user_id, tableRow) {
    fetch('/api/users/reject-photographer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Photographer ID ${user_id} rejected.`);
            tableRow.remove();
        } else {
            alert(`Failed to reject photographer: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error rejecting photographer:', error);
    });
}

function approveImage(photo_id, tableRow) {
    fetch('/api/admin/approve-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photo_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Image ID ${photo_id} approved.`);
            tableRow.remove();
        } else {
            alert(`Failed to approve image: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error approving image:', error);
    });
}

function denyImage(photo_id, tableRow) {
    fetch('/api/admin/deny-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photo_id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Image ID ${photo_id} denied.`);
            tableRow.remove();
        } else {
            alert(`Failed to deny image: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error denying image:', error);
    });
}