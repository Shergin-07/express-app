const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies (JSON and URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data store for blog posts
let blogs = [
  {
    id: '1',
    title: 'Mastering CSS Grid Layouts for Premium UIs',
    category: 'CSS & Design',
    author: 'Alex Dev',
    imageUrl: '/assets/css_grid_cover.jpg',
    content: 'CSS Grid Layout is the most powerful layout system available in CSS. It is a 2-dimensional system, meaning it can handle both columns and rows, unlike flexbox which is largely a 1-dimensional system. We explore fractional units (fr), grid template areas, implicit vs explicit grids, and alignment properties that make modern web applications shine.',
    date: 'July 20, 2026',
    createdAt: new Date('2026-07-20T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'Building Scalable RESTful APIs with Node.js and Express',
    category: 'Backend',
    author: 'Alex Dev',
    imageUrl: '/assets/express_api_cover.jpg',
    content: 'A deep dive into setting up clean routes, controllers, and error handling in Express to build APIs that are highly scalable, robust, and lightning fast. Learn best practices for REST endpoints, request body parsing, query parameter filtering, and structured responses.',
    date: 'July 19, 2026',
    createdAt: new Date('2026-07-19T14:30:00Z').toISOString()
  },
  {
    id: '3',
    title: 'Asynchronous JavaScript: Promises, Async/Await & Event Loop',
    category: 'JavaScript',
    author: 'Shergin-07',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    content: 'Asynchronous programming is at the core of Node.js and modern client-side JavaScript. Understand how the V8 JavaScript Engine handles microtasks, macrotasks, and promise resolution without blocking the main event thread.',
    date: 'July 22, 2026',
    createdAt: new Date('2026-07-22T09:15:00Z').toISOString()
  }
];

// Helper function to format date
function formatDate(dateObj) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateObj).toLocaleDateString('en-US', options);
}

// REST API Endpoints

// 1. GET /api/blogs - Get all blogs (supports ?search= query)
app.get('/api/blogs', (req, res) => {
  const { search, category } = req.query;
  let filteredBlogs = [...blogs];

  if (category && category !== 'All') {
    filteredBlogs = filteredBlogs.filter(b => 
      b.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const term = search.toLowerCase().trim();
    filteredBlogs = filteredBlogs.filter(b => 
      b.title.toLowerCase().includes(term) ||
      b.category.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.content.toLowerCase().includes(term)
    );
  }

  // Sort newest first
  filteredBlogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    success: true,
    count: filteredBlogs.length,
    data: filteredBlogs
  });
});

// 2. GET /api/blogs/:id - Get blog by ID
app.get('/api/blogs/:id', (req, res) => {
  const blog = blogs.find(b => b.id === req.params.id);
  if (!blog) {
    return res.status(404).json({ success: false, message: 'Blog post not found' });
  }
  res.json({ success: true, data: blog });
});

// 3. POST /api/blogs - Create a new blog post
app.post('/api/blogs', (req, res) => {
  const { title, category, author, imageUrl, content } = req.body;

  if (!title || !category || !author || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please provide title, category, author, and content'
    });
  }

  const newBlog = {
    id: Date.now().toString(),
    title: title.trim(),
    category: category.trim(),
    author: author.trim(),
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    content: content.trim(),
    date: formatDate(new Date()),
    createdAt: new Date().toISOString()
  };

  blogs.unshift(newBlog);

  res.status(201).json({
    success: true,
    message: 'Blog post published successfully',
    data: newBlog
  });
});

// 4. PUT /api/blogs/:id - Update an existing blog post
app.put('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const index = blogs.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Blog post not found' });
  }

  const { title, category, author, imageUrl, content } = req.body;

  if (!title || !category || !author || !content) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields'
    });
  }

  blogs[index] = {
    ...blogs[index],
    title: title.trim(),
    category: category.trim(),
    author: author.trim(),
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : blogs[index].imageUrl,
    content: content.trim(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Blog post updated successfully',
    data: blogs[index]
  });
});

// 5. DELETE /api/blogs/:id - Delete a blog post
app.delete('/api/blogs/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = blogs.length;
  blogs = blogs.filter(b => b.id !== id);

  if (blogs.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Blog post not found' });
  }

  res.json({
    success: true,
    message: 'Blog post deleted successfully'
  });
});

// Serve index.html for all uncaught routes (SPA friendly)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`DevVerse Server is running on port ${PORT}`);
});

