document.getElementById('searchBtn').addEventListener('click', fetchProfile);
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

// Add event listener for Enter key in the search bar
document.getElementById('username').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        fetchProfile();
    }
});

let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Display recent searches on page load
displayRecentSearches();

async function fetchProfile() {
    const username = document.getElementById('username').value.trim();
    const profileDiv = document.getElementById('profile');
    const loadingSpinner = document.getElementById('loading');

    if (!username) {
        profileDiv.innerHTML = "<p class='error'>Please enter a GitHub username.</p>";
        profileDiv.style.display = "block";
        return;
    }

    profileDiv.style.display = "none";
    loadingSpinner.style.display = "block";

    try {
        const cachedProfile = localStorage.getItem(username);
        if (cachedProfile) {
            const data = JSON.parse(cachedProfile);
            displayProfile(data);
            loadingSpinner.style.display = "none";
            return;
        }

        const response = await fetch(`https://api.github.com/users/${username}`);
        const data = await response.json();
        loadingSpinner.style.display = "none";

        if (data.message === 'Not Found') {
            profileDiv.innerHTML = "<p class='error'>User not found. Please try again.</p>";
            profileDiv.style.display = "block";
        } else {
            localStorage.setItem(username, JSON.stringify(data));
            displayProfile(data);
            addToRecentSearches(username); // Add the searched username to recent searches
        }
    } catch (error) {
        loadingSpinner.style.display = "none";
        profileDiv.innerHTML = "<p class='error'>An error occurred. Please try again later.</p>";
        profileDiv.style.display = "block";
    }
}

function displayProfile(data) {
    const profileDiv = document.getElementById('profile');
    profileDiv.innerHTML = `
        <img src="${data.avatar_url}" alt="${data.login}">
        <h2>${data.name || data.login}</h2>
        <p>${data.bio || 'No bio available'}</p>
        <span><strong>Location:</strong> ${data.location || 'Not specified'}</span>
        <span><strong>Company:</strong> ${data.company || 'Not specified'}</span>
        <span><strong>Twitter:</strong> ${data.twitter_username ? '@' + data.twitter_username : 'Not available'}</span>
        <span><strong>Member since:</strong> ${new Date(data.created_at).toLocaleDateString()}</span>
        <div class="profile-stats">
            <div class="stat">
                <p>${data.public_repos}</p>
                <span>Repos</span>
            </div>
            <div class="stat">
                <p>${data.followers}</p>
                <span>Followers</span>
            </div>
            <div class="stat">
                <p>${data.following}</p>
                <span>Following</span>
            </div>
        </div>
        <a href="${data.html_url}" target="_blank">Visit GitHub Profile</a>
    `;
    profileDiv.style.display = "block";
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function addToRecentSearches(username) {
    // Ensure the username is not already in recent searches
    if (!recentSearches.includes(username)) {
        recentSearches.unshift(username); // Add to the beginning of the array

        // Keep only the last 5 searches
        if (recentSearches.length > 5) {
            recentSearches.pop(); // Remove the oldest search
        }

        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        displayRecentSearches(); // Update the recent searches display
    }
}

function displayRecentSearches() {
    const recentList = document.getElementById('recent-list');
    recentList.innerHTML = recentSearches
        .map(username => `<div class="recent-item" onclick="searchProfile('${username}')">${username}</div>`)
        .join('');
}

function searchProfile(username) {
    document.getElementById('username').value = username;
    fetchProfile();
}

// Add this function to fetch GitHub statistics
async function fetchGitHubStats() {
    try {
        // Mock data for demonstration
        const mockStats = {
            totalRepos: "330M+",
            totalUsers: "100M+",
            githubStatus: "Operational",
        };

        // Update the DOM with mock data
        document.getElementById('total-repos').textContent = mockStats.totalRepos;
        document.getElementById('total-users').textContent = mockStats.totalUsers;
        document.getElementById('github-status').textContent = mockStats.githubStatus;

        // Optional: Fetch real GitHub status from GitHub Status API
        const statusResponse = await fetch('https://www.githubstatus.com/api/v2/status.json');
        const statusData = await statusResponse.json();
        document.getElementById('github-status').textContent = statusData.status.description;
    } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
        document.getElementById('github-status').textContent = "Unknown";
    }
}

// Call the function on page load
fetchGitHubStats();