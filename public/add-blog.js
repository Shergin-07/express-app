// Add Blog / Edit Blog Handler with Form Validation & Express API Integration

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('add-blog-form');
  const titleInput = document.getElementById('title');
  const categoryInput = document.getElementById('category');
  const authorInput = document.getElementById('author');
  const imageUrlInput = document.getElementById('image-url');
  const contentInput = document.getElementById('content');
  const submitBtn = document.getElementById('submit-btn');
  const formHeaderTitle = document.getElementById('form-header-title');
  const formHeaderDesc = document.getElementById('form-header-desc');

  // Parse URL parameter to check for Edit Mode
  const urlParams = new URLSearchParams(window.location.search);
  const blogId = urlParams.get('id');
  const isEditMode = Boolean(blogId);

  if (isEditMode) {
    setupEditMode(blogId);
  }

  // Load existing data for Edit Mode
  async function setupEditMode(id) {
    if (formHeaderTitle) formHeaderTitle.textContent = 'Edit Article';
    if (formHeaderDesc) formHeaderDesc.textContent = 'Update your article details and save the changes to DevVerse.';
    if (submitBtn) submitBtn.textContent = 'Update Article';

    try {
      const response = await fetch(`/api/blogs/${id}`);
      const result = await response.json();

      if (result.success) {
        const blog = result.data;
        titleInput.value = blog.title || '';
        categoryInput.value = blog.category || '';
        authorInput.value = blog.author || '';
        imageUrlInput.value = blog.imageUrl || '';
        contentInput.value = blog.content || '';
      } else {
        showToast('Article not found', 'error');
        setTimeout(() => window.location.href = '/', 1500);
      }
    } catch (err) {
      console.error('Error fetching blog for edit:', err);
      showToast('Error loading article data', 'error');
    }
  }

  // Real-time Input Validation
  const inputs = [
    { elem: titleInput, validate: val => val.trim().length >= 5 ? '' : 'Title must be at least 5 characters long.' },
    { elem: categoryInput, validate: val => val.trim().length >= 2 ? '' : 'Category is required (e.g., Frontend, Backend).' },
    { elem: authorInput, validate: val => val.trim().length >= 2 ? '' : 'Author name is required.' },
    { elem: imageUrlInput, validate: val => {
        if (!val.trim()) return ''; // Optional
        return /^https?:\/\/.+/i.test(val.trim()) ? '' : 'Please enter a valid URL starting with http:// or https://';
      } 
    },
    { elem: contentInput, validate: val => val.trim().length >= 20 ? '' : 'Article content must be at least 20 characters long.' }
  ];

  inputs.forEach(({ elem, validate }) => {
    if (!elem) return;
    
    // Validate on blur
    elem.addEventListener('blur', () => {
      const errorMsg = validate(elem.value);
      toggleError(elem, errorMsg);
    });

    // Clear error state on typing
    elem.addEventListener('input', () => {
      toggleError(elem, '');
    });
  });

  function toggleError(elem, errorMsg) {
    let errorElem = elem.parentNode.querySelector('.error-message');
    if (!errorElem) {
      errorElem = document.createElement('div');
      errorElem.className = 'error-message';
      elem.parentNode.appendChild(errorElem);
    }

    if (errorMsg) {
      elem.classList.add('invalid');
      errorElem.textContent = errorMsg;
      errorElem.style.display = 'block';
    } else {
      elem.classList.remove('invalid');
      errorElem.textContent = '';
      errorElem.style.display = 'none';
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Run full validation check
      let hasErrors = false;
      inputs.forEach(({ elem, validate }) => {
        if (!elem) return;
        const errorMsg = validate(elem.value);
        if (errorMsg) {
          toggleError(elem, errorMsg);
          hasErrors = true;
        }
      });

      if (hasErrors) {
        showToast('Please fix the errors in the form before submitting.', 'error');
        return;
      }

      const payload = {
        title: titleInput.value.trim(),
        category: categoryInput.value.trim(),
        author: authorInput.value.trim(),
        imageUrl: imageUrlInput.value.trim(),
        content: contentInput.value.trim()
      };

      // Disable submit button during request
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditMode ? 'Updating...' : 'Publishing...';
      }

      try {
        const url = isEditMode ? `/api/blogs/${blogId}` : '/api/blogs';
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast(isEditMode ? 'Article updated successfully!' : 'Article published successfully!', 'success');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          showToast(result.message || 'Failed to save article.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = isEditMode ? 'Update Article' : 'Publish Article';
          }
        }
      } catch (err) {
        console.error('Submission error:', err);
        showToast('Network error while saving article.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isEditMode ? 'Update Article' : 'Publish Article';
        }
      }
    });
  }

  // Toast Helper
  function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
