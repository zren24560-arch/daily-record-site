// ===========================
// Supabase 初始化
// ===========================
const SUPABASE_URL = "https://yvppdssdbxqfbvnuiulb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Uhi-GEGSmeosY1snKFzcCQ_NUMXQITn";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===========================
// 全局状态
// ===========================
let currentUser = null;
let allRecords  = [];

const CATEGORY_MAP = {
  bug:   { label: "Bug 修复", cls: "tag-bug"  },
  env:   { label: "环境配置", cls: "tag-env"  },
  perf:  { label: "性能优化", cls: "tag-perf" },
  code:  { label: "代码问题", cls: "tag-code" },
  other: { label: "其他",     cls: "tag-other"},
};

// ===========================
// 工具函数
// ===========================
const $ = id => document.getElementById(id);

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function showToast(msg, icon = "✅") {
  const el = $("toast");
  el.innerHTML = `<span>${icon}</span> ${msg}`;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function getInitials(nameOrEmail) {
  const name = (nameOrEmail || "").split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

// ===========================
// 认证：页面切换
// ===========================
function switchTab(tab) {
  if (tab === "login") {
    $("loginForm").style.display    = "";
    $("registerForm").style.display = "none";
    $("tabLogin").classList.add("active");
    $("tabRegister").classList.remove("active");
  } else {
    $("loginForm").style.display    = "none";
    $("registerForm").style.display = "";
    $("tabLogin").classList.remove("active");
    $("tabRegister").classList.add("active");
  }
}

function showAuthPage()  { $("authPage").style.display = ""; $("appPage").style.display = "none"; }
function showAppPage()   { $("authPage").style.display = "none"; $("appPage").style.display = ""; }

// ===========================
// 认证：登录
// ===========================
$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.disabled = true; btn.textContent = "登录中…";
  $("loginError").style.display = "none";

  const { data, error } = await db.auth.signInWithPassword({
    email:    $("loginEmail").value.trim(),
    password: $("loginPassword").value,
  });

  btn.disabled = false; btn.textContent = "登录";

  if (error) {
    $("loginError").textContent = error.message === "Invalid login credentials"
      ? "邮箱或密码错误，请重试"
      : error.message;
    $("loginError").style.display = "";
    return;
  }

  // onAuthStateChange 会自动触发跳转
});

// ===========================
// 认证：注册
// ===========================
$("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.disabled = true; btn.textContent = "注册中…";
  $("regError").style.display   = "none";
  $("regSuccess").style.display = "none";

  const name  = $("regName").value.trim();
  const email = $("regEmail").value.trim();
  const pwd   = $("regPassword").value;

  const { data, error } = await db.auth.signUp({
    email,
    password: pwd,
    options: { data: { display_name: name } },
  });

  btn.disabled = false; btn.textContent = "注册账号";

  if (error) {
    $("regError").textContent = error.message;
    $("regError").style.display = "";
    return;
  }

  // Supabase 默认需要邮件确认，如已关闭则直接登录
  if (data.user && data.session) {
    // 已直接登录（邮件确认已关闭）
    return;
  }

  $("regSuccess").innerHTML = `
    注册成功！<br>
    请检查 <strong>${email}</strong> 的收件箱，点击确认链接后即可登录。
  `;
  $("regSuccess").style.display = "";
  $("registerForm").reset();
});

// ===========================
// 认证：退出
// ===========================
async function logout() {
  await db.auth.signOut();
  showAuthPage();
  allRecords = [];
}

// ===========================
// 监听登录状态变化（核心）
// ===========================
db.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    currentUser = session.user;
    const displayName = currentUser.user_metadata?.display_name
      || currentUser.email;
    $("userName").textContent   = displayName;
    $("userAvatar").textContent = getInitials(displayName);
    showAppPage();
    await loadRecords();
    setupRealtimeSubscription();
  } else {
    currentUser = null;
    showAuthPage();
  }
});

// ===========================
// 实时订阅（Realtime）
// ===========================
let realtimeChannel = null;
function setupRealtimeSubscription() {
  if (realtimeChannel) db.removeChannel(realtimeChannel);
  realtimeChannel = db
    .channel("records-changes")
    .on("postgres_changes",
      { event: "*", schema: "public", table: "records" },
      async () => { await loadRecords(); }
    )
    .subscribe();
}

// ===========================
// 可见性切换
// ===========================
$("isPublic").addEventListener("change", () => {
  $("visibilityText").textContent = $("isPublic").checked ? "所有人可见" : "仅自己可见";
});

// ===========================
// 加载数据
// ===========================
async function loadRecords() {
  $("recordList").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div>加载中…</div>
    </div>`;

  const { data, error } = await db
    .from("records")
    .select("*, profiles(display_name)")
    .order("created_at", { ascending: false });

  if (error) {
    // 如果 profiles 联查失败（表不存在），降级只查 records
    const { data: d2, error: e2 } = await db
      .from("records")
      .select("*")
      .order("created_at", { ascending: false });
    if (e2) {
      $("recordList").innerHTML = `<div class="error-state">⚠️ 加载失败：${e2.message}</div>`;
      return;
    }
    allRecords = d2 || [];
  } else {
    allRecords = data || [];
  }

  updateStats(allRecords);
  applyFilter();
}

// ===========================
// 统计
// ===========================
function updateStats(records) {
  const today = new Date().toISOString().slice(0, 10);
  $("statTotal").textContent  = records.length;
  $("statSolved").textContent = records.filter(r => r.solution).length;
  $("statToday").textContent  = records.filter(r => r.created_at?.slice(0, 10) === today).length;
  $("statMine").textContent   = currentUser
    ? records.filter(r => r.user_id === currentUser.id).length
    : "—";
}

// ===========================
// 过滤 + 渲染
// ===========================
function applyFilter() {
  const keyword  = ($("searchInput").value || "").trim().toLowerCase();
  const category = $("filterCategory").value;
  const scope    = $("filterScope").value;

  const filtered = allRecords.filter(r => {
    const matchCat   = !category || r.category === category;
    const matchKw    = !keyword || r.title?.toLowerCase().includes(keyword) || r.description?.toLowerCase().includes(keyword);
    const matchScope = scope !== "mine" || r.user_id === currentUser?.id;
    return matchCat && matchKw && matchScope;
  });

  $("countBadge").textContent = filtered.length;
  renderList(filtered);
}

function renderList(records) {
  const container = $("recordList");

  if (records.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>暂无记录，去添加第一条吧！</p>
      </div>`;
    return;
  }

  const isOwner = r => currentUser && r.user_id === currentUser.id;

  container.innerHTML = records.map(r => {
    const cat = CATEGORY_MAP[r.category] || CATEGORY_MAP.other;
    const date = r.created_at
      ? new Date(r.created_at).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    const authorName = r.profiles?.display_name
      || (r.author_name || "匿名");
    const mine = isOwner(r);
    const pub  = r.is_public !== false;

    return `
      <div class="record-item ${mine ? "record-mine" : ""}" data-id="${r.id}">
        <div class="record-top">
          <div class="record-title-wrap">
            <h3>${escHtml(r.title)}</h3>
            <span class="tag ${cat.cls}">${cat.label}</span>
            ${!pub ? '<span class="tag tag-private">🔒 私密</span>' : ""}
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
            <span class="record-meta">${date}</span>
            ${mine ? `<button class="btn btn-danger" onclick="deleteRecord('${r.id}')">删除</button>` : ""}
          </div>
        </div>
        <div class="record-author">
          <span class="author-chip">${escHtml(authorName)}</span>
          ${mine ? '<span class="mine-chip">我</span>' : ""}
        </div>
        <p class="record-desc">${escHtml(r.description)}</p>
        ${r.solution ? `<div class="record-solution">${escHtml(r.solution)}</div>` : ""}
      </div>`;
  }).join("");
}

// ===========================
// 提交表单
// ===========================
$("recordForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> 保存中…`;

  const payload = {
    title:       $("title").value.trim(),
    category:    $("category").value,
    description: $("description").value.trim(),
    solution:    $("solution").value.trim() || null,
    user_id:     currentUser.id,
    author_name: currentUser.user_metadata?.display_name || currentUser.email,
    is_public:   $("isPublic").checked,
  };

  const { error } = await db.from("records").insert([payload]);

  btn.disabled = false;
  btn.innerHTML = `<span>💾</span> 保存记录`;

  if (error) {
    showToast("保存失败：" + error.message, "❌");
    return;
  }

  e.target.reset();
  $("isPublic").checked = true;
  $("visibilityText").textContent = "所有人可见";
  showToast("记录已保存！");
  // Realtime 会自动刷新，无需手动 loadRecords
});

// ===========================
// 删除
// ===========================
async function deleteRecord(id) {
  if (!confirm("确定删除这条记录？")) return;
  const { error } = await db.from("records").delete().eq("id", id);
  if (error) {
    showToast("删除失败：" + error.message, "❌");
    return;
  }
  showToast("已删除", "🗑️");
}

// ===========================
// 搜索 & 筛选事件
// ===========================
$("searchInput").addEventListener("input", applyFilter);
$("filterCategory").addEventListener("change", applyFilter);
$("filterScope").addEventListener("change", applyFilter);
