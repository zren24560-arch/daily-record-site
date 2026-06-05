const SUPABASE_URL = "https://yvppdssdbxqfbvnuiulb.supabase.co";
const SUPABASE_ANON_KEY = "这里替换成你完整复制的 publishable key";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  const loadingEl = document.getElementById("loading");
  const recordList = document.getElementById("recordList");

  if (loadingEl) loadingEl.style.display = "block";
  if (recordList) recordList.innerHTML = "";

  try {
    const { data, error } = await supabaseClient
      .from("records")
      .select("*")
      .limit(5);

    if (loadingEl) loadingEl.style.display = "none";

    if (error) {
      if (recordList) {
        recordList.innerHTML = `<div class="error">连接失败：${error.message}</div>`;
      }
      console.error("Supabase error:", error);
      return;
    }

    if (recordList) {
      recordList.innerHTML = `
        <div class="record-item">
          <h3>连接成功</h3>
          <p>已经成功读取 records 表。</p>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    }

    console.log("连接成功，返回数据：", data);
  } catch (err) {
    if (loadingEl) loadingEl.style.display = "none";
    if (recordList) {
      recordList.innerHTML = `<div class="error">异常：${err.message}</div>`;
    }
    console.error("JS exception:", err);
  }
}

testConnection();
