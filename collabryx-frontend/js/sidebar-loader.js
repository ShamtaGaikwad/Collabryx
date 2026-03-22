/**
 * Sidebar Loader - Dynamically load sidebar into all pages
 * AUTO-SKIPS: Login pages (login-role.html, student-login.html, teacher-login.html)
 * Usage: Add this script BEFORE closing body tag on ALL pages
 */

function loadSidebar() {
  // Skip sidebar loading on login pages
  const currentFileName = window.location.pathname.split('/').pop() || '';
  const loginPages = ['login-role.html', 'student-login.html', 'teacher-login.html', 'index.html', ''];
  
  if (loginPages.includes(currentFileName)) {
    console.log(`⏭️ Skipping sidebar for login page: ${currentFileName}`);
    return;
  }

  // Determine correct path
  const currentPath = window.location.pathname;
  const isPagesFolder = currentPath.includes('/pages/');
  const sidebarPath = isPagesFolder 
    ? '../components/sidebar.html' 
    : './components/sidebar.html';

  // Fetch and inject sidebar
  fetch(sidebarPath)
    .then(response => {
      if (!response.ok) throw new Error('Sidebar not found');
      return response.text();
    })
    .then(html => {
      // Prefer the dedicated #sidebar-container if it exists
      const dedicated = document.getElementById('sidebar-container');
      if (dedicated) {
        dedicated.innerHTML = html;
      } else {
        const sidebarContainer = document.createElement('div');
        sidebarContainer.innerHTML = html;
        const container = document.querySelector('.container') || document.body;
        if (container.firstChild) {
          container.insertBefore(sidebarContainer.firstChild, container.firstChild);
        } else {
          container.appendChild(sidebarContainer.firstChild);
        }
      }

      console.log('✅ Sidebar loaded successfully');

      // ✅ ALWAYS attach logout event (fixed)
      setTimeout(() => {
        const btn = document.getElementById("logoutBtn");
        if (btn) {
          btn.addEventListener("click", logout);
        }
      }, 100);

      highlightActivePage();
    })
    .catch(error => {
      console.warn('⚠️ Could not load sidebar:', error);
    });
}

function highlightActivePage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const pageMap = {
    'Dashboardpage.html': 'dashboard',
    'project.html': 'projects',
    'explore.html': 'explore',
    'message.html': 'messages',
    'requests.html': 'requests',
    'faculty.html': 'faculty',
    'profile.html': 'profile',
    'index.html': 'home'
  };

  const pageKey = pageMap[currentPage];

  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.classList.remove('active');
  });

  if (pageKey) {
    const activeLink = document.querySelector(`.sidebar-nav a[data-page="${pageKey}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.parentElement.classList.add('active');
    }
  }
}

// ✅ FINAL WORKING LOGOUT FUNCTION
window.logout = function () {
  if (confirm('Are you sure you want to logout?')) {
    // Clear all stored data
    localStorage.clear();
    sessionStorage.clear();

    // Smart redirect (works locally + hosting)
    if (window.location.pathname.includes('/pages/')) {
      window.location.href = "../index.html";
    } else {
      window.location.href = "./index.html";
    }
  }
};

// Load sidebar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
  loadSidebar();
}