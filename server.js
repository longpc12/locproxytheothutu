const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Cấu hình để phục vụ file tĩnh trong thư mục "public"
app.use(express.static("public"));
app.use(express.json());

// Hàm tạo chuỗi random 5 ký tự
function generateRandomString(length = 5) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// API xử lý lọc danh sách
app.post("/filter", (req, res) => {
    const { oldList, newList } = req.body;

    // Chuyển đổi dữ liệu từ string thành array, loại bỏ khoảng trắng
    let oldArr = oldList.split("\n").map(item => item.trim()).filter(item => item !== "");
    let newArr = newList.split("\n").map(item => item.trim()).filter(item => item !== "");

    // Hợp nhất danh sách cũ và mới rồi loại bỏ trùng lặp
    const sortedNewList = [...new Set([...oldArr, ...newArr])].sort();

    // Tìm các phần tử chỉ có trong danh sách mới (không có trong danh sách cũ)
    const uniqueNewItems = newArr.filter(item => !oldArr.includes(item));

    res.json({ sortedNewList, uniqueNewItems });
});

// API để tải file TXT với tên file ngẫu nhiên
app.get("/download", (req, res) => {
    const { data, type } = req.query;
    if (!data) return res.status(400).send("Không có dữ liệu để tải.");

    // Tạo tên file ngẫu nhiên dựa trên loại dữ liệu
    const randomString = generateRandomString(5);
    let fileName = "";

    if (type === "sortedNewList") {
        fileName = `moi_theo_thu_tu_proxy_${randomString}.txt`;
    } else if (type === "uniqueNewItems") {
        fileName = `proxy_moi_${randomString}.txt`;
    } else {
        fileName = `proxy_${randomString}.txt`;
    }

    // Ghi dữ liệu vào file
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, data.replace(/,/g, "\n"), "utf8");

    // Gửi file cho người dùng
    res.download(filePath, fileName, (err) => {
        if (err) console.error("Lỗi khi tải file:", err);
        fs.unlinkSync(filePath); // Xóa file sau khi tải
    });
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});
