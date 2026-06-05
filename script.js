const SUPABASE_URL = "https://yvpddssdbxqfbvnuiulb.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_publishable_Uhi-GEGSmeosY1snKFzcCQ_NUMXQITn";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("recordForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const solutionInput = document.getElementById("solution");
const recordList = document.getElementById("recordList");
const loadingEl = document.getElementById("loading");
const refreshBtn = document.getElementById("refreshBtn");

async function fetchRecords() {
  loadingEl.style.display = "block";
  recordList.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("records")
    .select("*")
    .order("created_at", { ascending: false });

  loadingEl.style.display = "none";

  if (error) {
    recordList.innerHTML = `<div class="error">加载失败：${error.message}</div>`;
    return;
  }

  if (!data || data.length === 0) {
    recordList.innerHTML = '<div class="empty">暂无记录，快添加第一条吧。</div>';
    return;
  }

  recordList.innerHTML = data
    .map(
      (record) => `
        <div class="record-item">
          <h3>${escapeHtml(record.title)}</h3>
          <div class="record-time">${formatDate(record.created_at)}</div>

          <div class="record-section">
            <strong>问题描述</strong>
            <p>${escapeHtml(record.description)}</p>
          </div>

          <div class="record-section">
            <strong>解决方案</strong>
            <p>${escapeHtml(record.solution || "暂无")}</p>
          </div>

          <div class="record-actions">
            <button class="btn delete-btn" onclick="deleteRecord(${record.id})">删除</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function addRecord(title, description, solution) {
  const { error } = await supabaseClient.from("records").insert([
    {
      title,
      description,
      solution
    }
  ]);

  if (error) {
    alert("保存失败：" + error.message);
    return false;
  }

  return true;
}

async function deleteRecord(id) {
  const confirmed = window.confirm("确定要删除这条记录吗？");
  if (!confirmed) return;

  const { error } = await supabaseClient.from("records").delete().eq("id", id);

  if (error) {
    alert("删除失败：" + error.message);
    return;
  }

  fetchRecords();
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const solution = solutionInput.value.trim();

  if (!title || !description) {
    alert("请填写标题和问题描述");
    return;
  }

  const ok = await addRecord(title, description, solution);
  if (!ok) return;

  form.reset();
  fetchRecords();
});

refreshBtn.addEventListener("click", fetchRecords);

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", { hour12: false });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

fetchRecords();

window.deleteRecord = deleteRecord;
