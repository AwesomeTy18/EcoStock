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
            tableBody.innerHTML = ''; // Clear existing rows
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