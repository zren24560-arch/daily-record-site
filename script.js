const form = document.getElementById("recordForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const solutionInput = document.getElementById("solution");
const recordList = document.getElementById("recordList");

let records = JSON.parse(localStorage.getItem("daily-records")) || [];

function saveRecords() {
  localStorage.setItem("daily-records", JSON.stringify(records));
}

function renderRecords() {
  if (records.length === 0) {
    recordList.innerHTML = '<div class="empty">暂无记录，快添加第一条吧。</div>';
    return;
  }

  recordList.innerHTML = records
    .slice()
    .reverse()
    .map(
      (record, index) => `
        <div class="record-item">
          <h3>${record.title}</h3>
          <p><strong>问题描述：</strong>${record.description}</p>
          <p><strong>解决方案：</strong>${record.solution || "暂无"}</p>
          <button onclick="deleteRecord(${records.length - 1 - index})">删除</button>
        </div>
      `
    )
    .join("");
}

function deleteRecord(index) {
  records.splice(index, 1);
  saveRecords();
  renderRecords();
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const newRecord = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    solution: solutionInput.value.trim()
  };

  records.push(newRecord);
  saveRecords();
  renderRecords();
  form.reset();
});

renderRecords();