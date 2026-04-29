const form = document.querySelector(".subscribe-form");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email");
  const note = form.querySelector(".form-note");

  if (note && email) {
    note.textContent = `Thanks, ${email}. You are on the list.`;
  }
});

const blogStorageKey = "jane-du-local-blogs";
const blogEditor = document.querySelector("[data-blog-editor]");
const blogForm = document.querySelector("[data-blog-form]");
const writingList = document.querySelector("[data-writing-list]");
const draftReader = document.querySelector("[data-draft-reader]");
const openBlogEditorButton = document.querySelector("[data-open-blog-editor]");
const closeBlogEditorButton = document.querySelector("[data-close-blog-editor]");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });

const formatBlogDate = (isoDate) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));

const getLocalBlogs = () => {
  try {
    return JSON.parse(localStorage.getItem(blogStorageKey)) ?? [];
  } catch {
    return [];
  }
};

const saveLocalBlogs = (blogs) => {
  localStorage.setItem(blogStorageKey, JSON.stringify(blogs));
};

const createBlogId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();

  return `blog-${Date.now()}`;
};

const renderDraftReader = (blog) => {
  if (!draftReader) return;

  draftReader.hidden = false;
  draftReader.innerHTML = `
    <p class="eyebrow">${escapeHtml(blog.topic)} &middot; ${formatBlogDate(blog.createdAt)}</p>
    <h2>${escapeHtml(blog.title)}</h2>
    <p>${escapeHtml(blog.summary)}</p>
    <div class="draft-body">${escapeHtml(blog.body)}</div>
  `;
  draftReader.scrollIntoView({ behavior: "smooth", block: "start" });
};

const createBlogRow = (blog) => {
  const row = document.createElement("button");
  row.type = "button";
  row.className = "content-row draft-row";
  row.dataset.published = blog.createdAt;
  row.innerHTML = `
    <span class="content-kicker">${escapeHtml(blog.topic)} &middot; ${formatBlogDate(blog.createdAt)}</span>
    <strong>${escapeHtml(blog.title)}</strong>
    <span>${escapeHtml(blog.summary)}</span>
  `;
  row.addEventListener("click", () => renderDraftReader(blog));
  return row;
};

const sortWritingList = () => {
  if (!writingList) return;

  [...writingList.children]
    .sort((left, right) => new Date(right.dataset.published) - new Date(left.dataset.published))
    .forEach((row) => writingList.appendChild(row));
};

const renderLocalBlogs = () => {
  if (!writingList) return;

  writingList.querySelectorAll(".draft-row").forEach((row) => row.remove());
  getLocalBlogs().forEach((blog) => writingList.appendChild(createBlogRow(blog)));
  sortWritingList();
};

openBlogEditorButton?.addEventListener("click", () => {
  if (!blogEditor) return;

  blogEditor.hidden = false;
  blogEditor.querySelector("input")?.focus();
});

closeBlogEditorButton?.addEventListener("click", () => {
  blogEditor.hidden = true;
});

blogForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(blogForm);
  const blog = {
    id: createBlogId(),
    title: String(formData.get("title")).trim(),
    topic: String(formData.get("topic")).trim(),
    summary: String(formData.get("summary")).trim(),
    body: String(formData.get("body")).trim(),
    createdAt: new Date().toISOString(),
  };

  if (!blog.title || !blog.topic || !blog.summary || !blog.body) return;

  const blogs = [blog, ...getLocalBlogs()];
  saveLocalBlogs(blogs);
  blogForm.reset();
  blogEditor.hidden = true;
  renderLocalBlogs();
  renderDraftReader(blog);
});

renderLocalBlogs();
