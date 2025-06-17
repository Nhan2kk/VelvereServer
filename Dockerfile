# Chọn base image
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình trước để tận dụng cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào Docker image
COPY . .

# Cấp quyền thực thi cho TypeScript compiler nếu cần
RUN chmod +x node_modules/.bin/tsc

# Biên dịch TypeScript sang JavaScript
RUN npx tsc

# Mở cổng cho ứng dụng (ví dụ 3000)
EXPOSE 3000

# Chạy ứng dụng Node từ file đã biên dịch
CMD ["node", "dist/index.js"]
