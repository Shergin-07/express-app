// DevVerse Home Page - Dynamic Blog Operations & Fetch API Integration

document.addEventListener('DOMContentLoaded', () => {
  const blogGrid = document.getElementById('blog-grid');
  const searchInput = document.getElementById('search-input');
  const categoryFilters = document.getElementById('category-filters');
  const articleModal = document.getElementById('article-modal');
  const deleteModal = document.getElementById('delete-modal');
  const toastContainer = document.getElementById('toast-container');

  let currentCategory = 'All';
  let searchTerm = '';
  let blogToDeleteId = null;

  // Initialize
  fetchBlogs();

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      fetchBlogs();
    });
  }

  // Category Filter Listener
  if (categoryFilters) {
    categoryFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-pill')) {
        document.querySelectorAll('.filter-pill').forEach(pill => pill.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.category || 'All';
        fetchBlogs();
      }
    });
  }

  // Fetch blogs from Express REST API
  async function fetchBlogs() {
    if (!blogGrid) return;

    // Show loading skeleton
    blogGrid.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;

    try {
      const url = new URL('/api/blogs', window.location.origin);
      if (searchTerm) url.searchParams.append('search', searchTerm);
      if (currentCategory && currentCategory !== 'All') url.searchParams.append('category', currentCategory);

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        renderBlogs(result.data);
      } else {
        showToast('Error loading articles', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      blogGrid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>Failed to load articles</h3>
          <p>Please check your connection or restart the server.</p>
        </div>
      `;
    }
  }

  // Render blog cards dynamically
  function renderBlogs(blogs) {
    if (!blogs || blogs.length === 0) {
      blogGrid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3>No articles found</h3>
          <p>${searchTerm ? `No results for "${searchTerm}"` : 'Be the first to publish a blog post on DevVerse!'}</p>
          <a href="/add-blog.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Write an Article</a>
        </div>
      `;
      return;
    }

    blogGrid.innerHTML = blogs.map(blog => {
      const catLower = (blog.category || '').toLowerCase();
      let badgeClass = 'badge-default';
      if (catLower.includes('frontend')) badgeClass = 'badge-frontend';
      else if (catLower.includes('backend')) badgeClass = 'badge-backend';
      else if (catLower.includes('javascript') || catLower.includes('js')) badgeClass = 'badge-js';
      else if (catLower.includes('css') || catLower.includes('design')) badgeClass = 'badge-css';
      else if (catLower.includes('devops') || catLower.includes('cloud')) badgeClass = 'badge-devops';

      return `
      <article class="blog-card" id="blog-card-${blog.id}">
        <div class="blog-card-img-wrapper">
          <img class="blog-card-img" src="${escapeHTML(blog.imageUrl)}" alt="${escapeHTML(blog.title)}" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80'">
          <span class="blog-card-badge ${badgeClass}">${escapeHTML(blog.category)}</span>
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <span class="blog-card-date">${escapeHTML(blog.date)}</span>
          </div>
          <h3 class="blog-card-title">${escapeHTML(blog.title)}</h3>
          <p class="blog-card-description">${escapeHTML(blog.content)}</p>
          
          <div class="blog-card-footer">
            <div class="blog-author-info">
              <img class="blog-author-avatar" src="/assets/author_avatar.jpg" alt="${escapeHTML(blog.author)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author)}&background=6366f1&color=fff'">
              <span class="blog-author-name">${escapeHTML(blog.author)}</span>
            </div>

            <div class="blog-card-actions">
              <button class="btn-icon btn-read" onclick="openArticleModal('${blog.id}')" title="Read Article">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <a href="/add-blog.html?id=${blog.id}" class="btn-icon btn-edit" title="Edit Article">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </a>
              <button class="btn-icon btn-delete" onclick="promptDelete('${blog.id}')" title="Delete Article">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
      `;
    }).join('');
  }

  // Open Article Reader Modal
  window.openArticleModal = async function(id) {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      const data = await res.json();
      if (data.success) {
        const blog = data.data;
        document.getElementById('modal-title').textContent = blog.title;
        document.getElementById('modal-category').textContent = blog.category;
        document.getElementById('modal-date').textContent = blog.date;
        document.getElementById('modal-author').textContent = blog.author;
        document.getElementById('modal-image').src = blog.imageUrl;
        document.getElementById('modal-content').textContent = blog.content;
        
        articleModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    } catch (e) {
      showToast('Could not fetch article details', 'error');
    }
  };

  // Close Article Modal
  window.closeArticleModal = function() {
    if (articleModal) articleModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Delete Prompt Modal
  window.promptDelete = function(id) {
    blogToDeleteId = id;
    if (deleteModal) deleteModal.classList.add('active');
  };

  window.closeDeleteModal = function() {
    blogToDeleteId = null;
    if (deleteModal) deleteModal.classList.remove('active');
  };

  // Confirm Delete Action
  window.confirmDelete = async function() {
    if (!blogToDeleteId) return;

    try {
      const response = await fetch(`/api/blogs/${blogToDeleteId}`, {
        method: 'DELETE'
      });
      const resData = await response.json();

      if (resData.success) {
        const cardElem = document.getElementById(`blog-card-${blogToDeleteId}`);
        if (cardElem) {
          cardElem.style.transition = 'all 0.3s ease';
          cardElem.style.opacity = '0';
          cardElem.style.transform = 'scale(0.9)';
          setTimeout(() => cardElem.remove(), 300);
        }
        showToast('Blog post deleted successfully', 'success');
        closeDeleteModal();
        setTimeout(fetchBlogs, 350);
      } else {
        showToast(resData.message || 'Failed to delete blog', 'error');
      }
    } catch (err) {
      showToast('Server error while deleting blog', 'error');
    }
  };

  // Helper for HTML escaping
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Toast Notification System
  window.showToast = function(message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${escapeHTML(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };
});
