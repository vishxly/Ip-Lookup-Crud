// Global variables
let users = [];
let editingUserId = null;
let currentPage = 1;
const usersPerPage = 10;

// DOM elements
const userForm = document.getElementById("userForm");
const userTable = document.getElementById("userTable");
const submitButton = document.querySelector('#userForm button[type="submit"]');
const formErrors = document.getElementById("formErrors");

// Fetch and display users
async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/users");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    users = await response.json();
    displayUsers();
  } catch (error) {
    console.error("Failed to fetch users:", error);
    userTable.innerHTML =
      "<p class='alert alert-danger'>Failed to load users. Please try again later.</p>";
  }
}

// Display users in the table
function displayUsers() {
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const usersToDisplay = users.slice(startIndex, endIndex);

  let tableHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Weather</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  usersToDisplay.forEach((user) => {
    const address = user.address
      ? `${user.address.city || "N/A"}, ${user.address.country || "N/A"}`
      : "N/A";
    const weather = user.weather
      ? `${user.weather.temperature || "N/A"}°C, ${
          user.weather.condition || "N/A"
        }`
      : "N/A";

    tableHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.age}</td>
                <td>${user.gender}</td>
                <td>${user.phone}</td>
                <td>${user.email}</td>
                <td>${address}</td>
                <td>${weather}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            </tr>
        `;
  });

  tableHTML += "</tbody></table>";
  userTable.innerHTML = tableHTML;

  displayPagination();
}

// Display pagination
function displayPagination() {
  const totalPages = Math.ceil(users.length / usersPerPage);
  let paginationHTML = '<nav><ul class="pagination justify-content-center">';

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
            <li class="page-item ${i === currentPage ? "active" : ""}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
  }

  paginationHTML += "</ul></nav>";
  document.getElementById("pagination").innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
  currentPage = page;
  displayUsers();
}

// Handle form submission (create or update user)
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const userData = {
    name: document.getElementById("name").value.trim(),
    age: parseInt(document.getElementById("age").value),
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
  };

  try {
    let response;
    if (editingUserId) {
      // Update existing user
      response = await fetch(
        `http://localhost:3000/api/users/${editingUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );
    } else {
      // Create new user
      response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(editingUserId ? "User updated:" : "User created:", result);

    // Reset form and fetch updated user list
    resetForm();
    fetchUsers();
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});

// Validate form
function validateForm() {
  const name = document.getElementById("name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.getElementById("gender").value;
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  let isValid = true;
  let errorMessages = [];

  if (name === "") {
    isValid = false;
    errorMessages.push("Name is required.");
  }

  if (age === "" || isNaN(age) || age < 0 || age > 120) {
    isValid = false;
    errorMessages.push("Please enter a valid age between 0 and 120.");
  }

  if (gender === "") {
    isValid = false;
    errorMessages.push("Please select a gender.");
  }

  if (phone === "" || !/^\d{10}$/.test(phone)) {
    isValid = false;
    errorMessages.push("Please enter a valid 10-digit phone number.");
  }

  if (email === "" || !/\S+@\S+\.\S+/.test(email)) {
    isValid = false;
    errorMessages.push("Please enter a valid email address.");
  }

  if (!isValid) {
    displayErrorMessages(errorMessages);
  } else {
    formErrors.style.display = "none";
  }

  return isValid;
}

// Display error messages
function displayErrorMessages(messages) {
  formErrors.innerHTML = messages.map((msg) => `<p>${msg}</p>`).join("");
  formErrors.style.display = "block";
}

// Edit user
function editUser(userId) {
  editingUserId = userId;
  const user = users.find((u) => u._id === userId);
  if (user) {
    document.getElementById("name").value = user.name;
    document.getElementById("age").value = user.age;
    document.getElementById("gender").value = user.gender;
    document.getElementById("phone").value = user.phone;
    document.getElementById("email").value = user.email;

    submitButton.textContent = "Update User";
  }
}

// Delete user
async function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("User deleted successfully");
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the user. Please try again.");
    }
  }
}

// Reset form
function resetForm() {
  userForm.reset();
  editingUserId = null;
  submitButton.textContent = "Submit";
  formErrors.style.display = "none";
}

// Initial fetch of users
fetchUsers();
