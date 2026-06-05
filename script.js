const SUPABASE_URL = "https://bqnsyycawzrzjvalbrmz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Y8Fgkr2nmh7Ij7kYscEt9g_oS3-ZWqq";

console.log("URL =", SUPABASE_URL);
console.log("KEY length =", SUPABASE_ANON_KEY.length);
console.log("KEY first 30 =", SUPABASE_ANON_KEY.slice(0, 30));
console.log("KEY last 20 =", SUPABASE_ANON_KEY.slice(-20));

// 检查是否包含非 ASCII 字符
for (let i = 0; i < SUPABASE_ANON_KEY.length; i++) {
  const code = SUPABASE_ANON_KEY.charCodeAt(i);
  if (code > 255) {
    console.error("发现异常字符，位置:", i, "字符:", SUPABASE_ANON_KEY[i], "编码:", code);
  }
}

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
      console.error("Supabase error:", error);
      if (recordList) {
        recordList.innerHTML = `<div class="error">连接失败：${error.message}</div>`;
      }
      return;
    }

    if (recordList) {
      recordList.innerHTML = `
        <div class="record-item">
          <h3>连接成功</h3>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
      `;
    }
  } catch (err) {
    console.error("JS exception:", err);
    if (loadingEl) loadingEl.style.display = "none";
    if (recordList) {
      recordList.innerHTML = `<div class="error">异常：${err.message}</div>`;
    }
  }
}

testConnection();
