* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  background: #f5f7fb;
  color: #333;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px 60px;
}

.header {
  text-align: center;
  margin-bottom: 28px;
}

.header h1 {
  margin: 0 0 10px;
  font-size: 34px;
  color: #222;
}

.header p {
  margin: 0;
  color: #666;
  font-size: 15px;
}

.panel {
  background: #fff;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 22px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.panel h2 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #222;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #444;
  font-weight: 600;
}

input,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fafafa;
}

input:focus,
textarea:focus {
  border-color: #4f7cff;
  background: #fff;
}

textarea {
  min-height: 110px;
  resize: vertical;
}

.btn {
  border: none;
  background: #4f7cff;
  color: #fff;
  padding: 11px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.btn:hover {
  background: #3f6ef0;
}

.btn.secondary {
  background: #eef3ff;
  color: #4f7cff;
}

.btn.secondary:hover {
  background: #dde7ff;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.record-item {
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 18px;
  background: #fcfcfd;
}

.record-item h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #222;
}

.record-time {
  margin-bottom: 12px;
  color: #888;
  font-size: 13px;
}

.record-section {
  margin-top: 12px;
}

.record-section strong {
  display: inline-block;
  margin-bottom: 6px;
  color: #333;
}

.record-section p {
  margin: 0;
  color: #555;
  line-height: 1.7;
  white-space: pre-wrap;
}

.record-actions {
  margin-top: 16px;
}

.delete-btn {
  background: #ff5f57;
}

.delete-btn:hover {
  background: #e14d45;
}

.loading,
.empty,
.error {
  text-align: center;
  padding: 24px 12px;
  color: #777;
}

.error {
  color: #d93025;
}

@media (max-width: 768px) {
  .container {
    padding: 20px 12px 40px;
  }

  .header h1 {
    font-size: 28px;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
}
