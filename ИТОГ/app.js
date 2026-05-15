const STORAGE_KEY = "redaction-blog-posts";

const seedPosts = [
  {
    id: crypto.randomUUID(),
    title: "Почему карточка статьи должна работать до клика",
    author: "Ксения",
    category: "UX",
    excerpt: "Разбираем, какие подсказки помогают читателю понять ценность материала ещё в ленте.",
    content:
      "Карточка статьи — это маленькая витрина. До перехода внутрь читатель уже оценивает тему, тон, автора и примерное время чтения.\n\nХорошая карточка не перегружает деталями. Она честно показывает заголовок, краткое описание и рубрику, а второстепенные действия убирает ниже основного контента.\n\nВ CRUD-блоге это особенно важно: пользователь постоянно сравнивает материалы, редактирует их и должен быстро видеть результат своих решений.",
    createdAt: "2026-05-08T10:30:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    title: "Live preview как способ меньше ошибаться",
    author: "Редактор",
    category: "Код",
    excerpt: "Предпросмотр снижает количество лишних сохранений и помогает заметить пустые абзацы.",
    content:
      "Предпросмотр делает форму спокойнее. Пользователь видит не набор полей, а будущую публикацию, поэтому быстрее замечает слабый заголовок или слишком короткое описание.\n\nВ этом проекте превью обновляется сразу во время ввода. Текст безопасно выводится как абзацы, а время чтения рассчитывается автоматически.\n\nТакая логика показывает, что JavaScript здесь не декоративный, а отвечает за реальное поведение интерфейса.",
    createdAt: "2026-05-10T14:00:00.000Z"
  },
  {
    id: crypto.randomUUID(),
    title: "Мини-гайд по визуальному ритму блога",
    author: "Арт-дирекция",
    category: "Визуал",
    excerpt: "Контрастные обложки, плотная типографика и спокойные поля помогают ленте не распадаться.",
    content:
      "Визуальный ритм складывается из повторяемых размеров, понятных отступов и аккуратных акцентов. Если каждая карточка ведёт себя по-разному, лента быстро становится шумной.\n\nДля учебного проекта важно показать не только красивую первую секцию, но и устойчивую систему. Карточки, форма, превью и фильтры должны выглядеть как части одного продукта.\n\nПоэтому здесь используются общие радиусы, близкие размеры кнопок и несколько характерных цветовых акцентов.",
    createdAt: "2026-05-12T08:15:00.000Z"
  }
];

const state = {
  posts: loadPosts(),
  query: "",
  category: "all",
  sort: "newest",
  editingId: null
};

const elements = {
  form: document.querySelector("#articleForm"),
  articleId: document.querySelector("#articleId"),
  title: document.querySelector("#titleInput"),
  author: document.querySelector("#authorInput"),
  category: document.querySelector("#categoryInput"),
  excerpt: document.querySelector("#excerptInput"),
  content: document.querySelector("#contentInput"),
  titleError: document.querySelector("#titleError"),
  authorError: document.querySelector("#authorError"),
  categoryError: document.querySelector("#categoryError"),
  excerptError: document.querySelector("#excerptError"),
  contentError: document.querySelector("#contentError"),
  excerptCount: document.querySelector("#excerptCount"),
  contentCount: document.querySelector("#contentCount"),
  articleList: document.querySelector("#articleList"),
  emptyState: document.querySelector("#emptyState"),
  editorTitle: document.querySelector("#editor-title"),
  submitButton: document.querySelector("#submitButton"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  fillExampleButton: document.querySelector("#fillExampleButton"),
  search: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  sort: document.querySelector("#sortSelect"),
  clearStorageButton: document.querySelector("#clearStorageButton"),
  totalArticles: document.querySelector("#totalArticles"),
  totalCategories: document.querySelector("#totalCategories"),
  totalMinutes: document.querySelector("#totalMinutes"),
  previewCategory: document.querySelector("#previewCategory"),
  previewReadTime: document.querySelector("#previewReadTime"),
  previewTitle: document.querySelector("#previewTitle"),
  previewExcerpt: document.querySelector("#previewExcerpt"),
  previewContent: document.querySelector("#previewContent"),
  previewCover: document.querySelector(".preview-cover"),
  toast: document.querySelector("#toast")
};

function loadPosts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
    return [...seedPosts];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...seedPosts];
  } catch {
    return [...seedPosts];
  }
}

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getReadTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function getCoverClass(category) {
  const map = {
    UX: "ux",
    "Визуал": "visual",
    "Код": "code",
    "Кейсы": "cases"
  };

  return map[category] || "";
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(dateString));
}

function renderParagraphs(content) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return "<p>Основной текст статьи будет отображаться абзацами.</p>";
  }

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function getFilteredPosts() {
  const normalizedQuery = state.query.trim().toLowerCase();

  return state.posts
    .filter((post) => {
      const matchesCategory = state.category === "all" || post.category === state.category;
      const searchable = `${post.title} ${post.author} ${post.excerpt} ${post.content}`.toLowerCase();
      return matchesCategory && searchable.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (state.sort === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (state.sort === "title") {
        return a.title.localeCompare(b.title, "ru");
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function renderStats() {
  const categories = new Set(state.posts.map((post) => post.category));
  const totalMinutes = state.posts.reduce((sum, post) => sum + getReadTime(post.content), 0);

  elements.totalArticles.textContent = state.posts.length;
  elements.totalCategories.textContent = categories.size;
  elements.totalMinutes.textContent = totalMinutes;
}

function renderCategoryFilter() {
  const categories = [...new Set(state.posts.map((post) => post.category))].sort((a, b) => a.localeCompare(b, "ru"));
  const current = elements.categoryFilter.value || "all";

  elements.categoryFilter.innerHTML = '<option value="all">Все рубрики</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.append(option);
  });

  elements.categoryFilter.value = categories.includes(current) ? current : "all";
  state.category = elements.categoryFilter.value;
}

function renderPosts() {
  const posts = getFilteredPosts();
  elements.articleList.innerHTML = "";
  elements.emptyState.hidden = posts.length > 0;

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "article-card";
    article.innerHTML = `
      <div class="cover ${getCoverClass(post.category)}" aria-hidden="true"></div>
      <div class="article-body">
        <p class="article-meta">${escapeHtml(post.category)} · ${formatDate(post.createdAt)} · ${getReadTime(post.content)} мин чтения</p>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="excerpt">${escapeHtml(post.excerpt)}</p>
        <p class="article-meta">Автор: ${escapeHtml(post.author)}</p>
        <div class="article-actions">
          <button class="button secondary" type="button" data-action="edit" data-id="${post.id}">Редактировать</button>
          <button class="button ghost delete-button" type="button" data-action="delete" data-id="${post.id}">Удалить</button>
        </div>
      </div>
    `;
    elements.articleList.append(article);
  });
}

function renderAll() {
  renderCategoryFilter();
  renderStats();
  renderPosts();
  updatePreview();
}

function setError(field, message) {
  elements[`${field}Error`].textContent = message;
}

function clearErrors() {
  ["title", "author", "category", "excerpt", "content"].forEach((field) => setError(field, ""));
}

function validateForm() {
  clearErrors();
  const data = getFormData();
  const errors = {};

  if (data.title.length < 6) {
    errors.title = "Заголовок должен быть не короче 6 символов.";
  }

  if (data.author.length < 2) {
    errors.author = "Укажите автора.";
  }

  if (!data.category) {
    errors.category = "Выберите рубрику.";
  }

  if (data.excerpt.length < 20) {
    errors.excerpt = "Описание должно быть не короче 20 символов.";
  }

  if (data.content.length < 80) {
    errors.content = "Текст статьи должен быть не короче 80 символов.";
  }

  Object.entries(errors).forEach(([field, message]) => setError(field, message));
  return {
    isValid: Object.keys(errors).length === 0,
    data
  };
}

function getFormData() {
  return {
    title: elements.title.value.trim(),
    author: elements.author.value.trim(),
    category: elements.category.value,
    excerpt: elements.excerpt.value.trim(),
    content: elements.content.value.trim()
  };
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.articleId.value = "";
  elements.editorTitle.textContent = "Новая статья";
  elements.submitButton.textContent = "Опубликовать";
  elements.cancelEditButton.hidden = true;
  clearErrors();
  updateCounters();
  updatePreview();
}

function editPost(id) {
  const post = state.posts.find((item) => item.id === id);

  if (!post) {
    showToast("Статья не найдена");
    return;
  }

  state.editingId = id;
  elements.articleId.value = post.id;
  elements.title.value = post.title;
  elements.author.value = post.author;
  elements.category.value = post.category;
  elements.excerpt.value = post.excerpt;
  elements.content.value = post.content;
  elements.editorTitle.textContent = "Редактирование";
  elements.submitButton.textContent = "Сохранить изменения";
  elements.cancelEditButton.hidden = false;
  clearErrors();
  updateCounters();
  updatePreview();
  document.querySelector("#editor").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deletePost(id) {
  const post = state.posts.find((item) => item.id === id);

  if (!post) {
    return;
  }

  const approved = confirm(`Удалить статью «${post.title}»?`);
  if (!approved) {
    return;
  }

  state.posts = state.posts.filter((item) => item.id !== id);
  savePosts();

  if (state.editingId === id) {
    resetForm();
  }

  renderAll();
  showToast("Статья удалена");
}

function handleSubmit(event) {
  event.preventDefault();
  const { isValid, data } = validateForm();

  if (!isValid) {
    showToast("Проверьте поля формы");
    return;
  }

  if (state.editingId) {
    state.posts = state.posts.map((post) =>
      post.id === state.editingId
        ? {
            ...post,
            ...data
          }
        : post
    );
    showToast("Изменения сохранены");
  } else {
    state.posts.unshift({
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    });
    showToast("Статья опубликована");
  }

  savePosts();
  resetForm();
  renderAll();
}

function updateCounters() {
  elements.excerptCount.textContent = elements.excerpt.value.length;
  elements.contentCount.textContent = elements.content.value.trim().length;
}

function updatePreview() {
  const data = getFormData();
  const category = data.category || "Рубрика";
  const title = data.title || "Заголовок появится здесь";
  const excerpt = data.excerpt || "Краткое описание обновляется во время ввода.";
  const content = data.content || "";

  elements.previewCategory.textContent = category;
  elements.previewReadTime.textContent = `${getReadTime(content)} мин`;
  elements.previewTitle.textContent = title;
  elements.previewExcerpt.textContent = excerpt;
  elements.previewContent.innerHTML = renderParagraphs(content);
  elements.previewCover.className = `cover preview-cover ${getCoverClass(category)}`;
}

function fillExample() {
  elements.title.value = "Как собрать понятный редактор для блога";
  elements.author.value = "Ксения";
  elements.category.value = "Кейсы";
  elements.excerpt.value = "Короткий разбор формы, превью и действий, которые нужны автору каждый день.";
  elements.content.value =
    "Редактор блога должен помогать автору сосредоточиться на тексте, а не угадывать, что произойдёт после сохранения.\n\nСначала пользователь вводит заголовок и описание, затем выбирает рубрику и пишет основной материал. Live preview сразу показывает будущую карточку и страницу статьи.\n\nВалидация не даёт опубликовать пустой материал, а редактирование и удаление остаются рядом с каждой карточкой в ленте.";
  clearErrors();
  updateCounters();
  updatePreview();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

elements.form.addEventListener("submit", handleSubmit);
elements.cancelEditButton.addEventListener("click", resetForm);
elements.fillExampleButton.addEventListener("click", fillExample);

[elements.title, elements.author, elements.category, elements.excerpt, elements.content].forEach((input) => {
  input.addEventListener("input", () => {
    updateCounters();
    updatePreview();
  });
});

elements.articleList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  if (button.dataset.action === "edit") {
    editPost(button.dataset.id);
  }

  if (button.dataset.action === "delete") {
    deletePost(button.dataset.id);
  }
});

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderPosts();
});

elements.categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderPosts();
});

elements.sort.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderPosts();
});

elements.clearStorageButton.addEventListener("click", () => {
  const approved = confirm("Вернуть демо-статьи и удалить текущие изменения?");

  if (!approved) {
    return;
  }

  state.posts = [...seedPosts];
  savePosts();
  resetForm();
  renderAll();
  showToast("Демо восстановлено");
});

renderAll();
