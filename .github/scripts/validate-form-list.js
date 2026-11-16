// 檢查 data/form_list.json 格式，避免錯誤資料部署後讓網頁載入失敗
const fs = require("fs");

const file = process.argv[2] || "data/form_list.json";
const errors = [];

let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.log(`::error file=${file}::JSON 解析失敗：${e.message}`);
  process.exit(1);
}

if (!Array.isArray(data)) {
  errors.push("最外層必須是陣列 [ ... ]");
} else {
  const seen = new Set();
  data.forEach((item, i) => {
    const label = `第 ${i + 1} 項${item && item.key ? `（${item.key}）` : ""}`;
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      errors.push(`${label} 必須是物件 { ... }`);
      return;
    }
    for (const field of ["key", "zhName"]) {
      if (typeof item[field] !== "string" || !item[field].trim()) {
        errors.push(`${label} 缺少 ${field}`);
      }
    }
    if (typeof item.url !== "string") {
      errors.push(`${label} 缺少 url（尚無連結請填空字串 ""）`);
    } else if (item.url && !/^https?:\/\//i.test(item.url)) {
      errors.push(`${label} 的 url 必須以 http:// 或 https:// 開頭`);
    }
    if (item.key) {
      if (seen.has(item.key)) errors.push(`${label} 的 key 重複`);
      seen.add(item.key);
    }
  });
}

if (errors.length) {
  errors.forEach((msg) => console.log(`::error file=${file}::${msg}`));
  process.exit(1);
}
console.log(`${file} OK（${data.length} 項）`);
