# Chọn base image
FROM node:18

# Tạo thư mục làm việc
WORKDIR /app

# Copy file cấu hình và cài đặt
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source vào Docker image
COPY . .

# Biên dịch TypeScript
RUN npx tsc

# Mở cổng (ví dụ dùng 3000)
EXPOSE 3000

# Chạy app
CMD ["node", "dist/index.js"]
