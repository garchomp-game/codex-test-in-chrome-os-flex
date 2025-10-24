(() => {
  const STORAGE_KEY = 'bulletin-board-posts';
  const form = document.getElementById('post-form');
  const authorInput = document.getElementById('author');
  const contentInput = document.getElementById('content');
  const postsContainer = document.getElementById('posts');
  const template = document.getElementById('post-template');

  const loadPosts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid post data');
      }
      return parsed
        .filter((post) => post && typeof post === 'object')
        .map((post) => ({
          id: String(post.id ?? ''),
          author: String(post.author ?? ''),
          content: String(post.content ?? ''),
          timestamp: Number(post.timestamp ?? Date.now())
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to load posts', error);
      return [];
    }
  };

  const savePosts = (posts) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const createPostElement = (post) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = post.id;

    const authorEl = node.querySelector('.font-bold');
    const timeEl = node.querySelector('time');
    const contentEl = node.querySelector('p');

    authorEl.textContent = post.author || '匿名';
    timeEl.textContent = formatDate(post.timestamp);
    timeEl.dateTime = new Date(post.timestamp).toISOString();
    contentEl.textContent = post.content;

    return node;
  };

  const renderPosts = (posts) => {
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'まだ投稿がありません。最初のメッセージを投稿しましょう！';
      postsContainer.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    posts.forEach((post) => {
      const element = createPostElement(post);
      fragment.appendChild(element);
    });

    postsContainer.appendChild(fragment);
  };

  const posts = loadPosts();
  renderPosts(posts);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const author = authorInput.value.trim().slice(0, 30);
    const content = contentInput.value.trim();

    if (!content) {
      contentInput.focus();
      return;
    }

    const newPost = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      author,
      content,
      timestamp: Date.now()
    };

    posts.unshift(newPost);
    savePosts(posts);
    renderPosts(posts);

    contentInput.value = '';
    contentInput.focus();
  });

  postsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest('button')?.getAttribute('aria-label') === '投稿を削除') {
      const article = target.closest('article');
      if (!article) {
        return;
      }
      const postId = article.dataset.id;
      const index = posts.findIndex((post) => post.id === postId);
      if (index === -1) {
        return;
      }
      posts.splice(index, 1);
      savePosts(posts);
      renderPosts(posts);
    }
  });
})();
