import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    initQuill();
    setupEventListeners();
    await loadPosts();
});

function initQuill() {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });
}

function setupEventListeners() {
    const newPostBtn = document.getElementById('newPostBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const postForm = document.getElementById('postForm');
    const modal = document.getElementById('newPostForm');

    newPostBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        resetForm();
    });

    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSubmit();
    });
}

async function handleSubmit() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const content = quill.root.innerHTML;
    
    const spinner = document.getElementById('loadingSpinner');
    const modal = document.getElementById('newPostForm');
    
    try {
        spinner.classList.remove('hidden');
        await backend.createPost(title, content, author);
        modal.classList.add('hidden');
        resetForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
    } finally {
        spinner.classList.add('hidden');
    }
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    quill.setContents([]);
}

async function loadPosts() {
    const spinner = document.getElementById('loadingSpinner');
    const postsContainer = document.getElementById('posts');
    
    try {
        spinner.classList.remove('hidden');
        const posts = await backend.getPosts();
        
        postsContainer.innerHTML = posts.map(post => `
            <article class="post">
                <h2>${post.title}</h2>
                <div class="post-meta">
                    <span class="author">By ${post.author}</span>
                    <span class="date">${new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}</span>
                </div>
                <div class="post-content">${post.body}</div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Please refresh the page.</p>';
    } finally {
        spinner.classList.add('hidden');
    }
}
