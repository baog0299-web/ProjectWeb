// Đây là mảng chứa tất cả dữ liệu quán cà phê của bạn
// Dữ liệu được trích xuất và chuẩn hóa từ file Word
const allCoffeeShops = [
  {
    id: 1,
    name: "LAVA Coffee", // [cite: 3]
    rating: 4.3, // [cite: 16]
    image: "assets/image/cfimg/lava1.png",
    location_area: "Quận Gò Vấp", // [cite: 11]
    need: "Học tập", // Suy ra từ 
    criteria: ["Wifi miễn phí", "Ổ cắm mỗi bàn", "Sân thượng", "View đẹp", "Vintage", "Máy lạnh"] // Suy ra từ [cite: 6, 7, 9, 10, 22]
  },
  {
    id: 2,
    name: "Du Miên Garden", // [cite: 27]
    rating: 4.3, // [cite: 40]
    image: "assets/image/cfimg/dumien1.png",
    location_area: "Quận Gò Vấp", // [cite: 35]
    need: "Gia đình", // Suy ra từ 
    criteria: ["Ngoài trời", "Cây xanh", "Phù hợp gia đình", "Wifi mạnh", "Sân thượng", "Check-in sống ảo", "Ấm cúng"] // Suy ra từ [cite: 30, 31, 34, 47, 48]
  },
  {
    id: 3,
    name: "Saigon Chic", // [cite: 51]
    rating: 4.4, // [cite: 64]
    image: "assets/image/cfimg/saigonchic1.png",
    location_area: "Quận Gò Vấp", // [cite: 59]
    need: "Hẹn hò", // Suy ra từ [cite: 52, 200]
    criteria: ["Ngoài trời", "View đẹp", "Cây xanh", "Đặt bàn trước", "Máy lạnh", "Wifi miễn phí", "Lý tưởng làm việc", "Lãng mạn", "Check-in sống ảo", "Gửi xe miễn phí", "WC sạch"] // Suy ra từ [cite: 54, 56, 57, 58, 71, 72, 73, 75]
  },
  {
    id: 4,
    name: "Thức Coffee", // [cite: 78]
    rating: 4.1, // [cite: 92]
    image: "assets/image/cfimg/thuc1.png",
    location_area: "Quận Gò Vấp", // [cite: 86]
    need: "Làm việc", // Suy ra từ [cite: 89, 204]
    criteria: ["Wifi miễn phí", "Máy lạnh", "Gửi xe miễn phí", "Menu đa dạng", "View đường phố", "Yên tĩnh", "Lý tưởng làm việc", "24/7", "Ấm cúng"] // Suy ra từ [cite: 81, 82, 83, 84, 85, 99, 100, 101]
  },
  {
    id: 5,
    name: "Oasis Cafe", // [cite: 104]
    rating: 4.8, // [cite: 117]
    image: "assets/image/cfimg/oasis1.png",
    location_area: "Quận Gò Vấp", // [cite: 112]
    need: "Check-in / \"Sống ảo\"", // Suy ra từ [cite: 115, 212]
    criteria: ["Sân vườn", "Phù hợp gia đình", "Menu đa dạng", "View đẹp", "Thân thiện", "Wifi miễn phí", "Máy lạnh", "Học nhóm", "Ngoài trời", "Phòng riêng", "Gửi xe miễn phí", "Lãng mạn", "Cây xanh", "Check-in sống ảo"] // Suy ra từ [cite: 107, 108, 109, 110, 111, 123, 124, 125]
  },
  {
    id: 6,
    name: "Cà phê Ngày xưa ấy", // [cite: 128]
    rating: 4.4, // [cite: 140]
    image: "assets/image/cfimg/ngayxuaay1.png",
    location_area: "Quận Gò Vấp", // [cite: 136]
    need: "Đọc sách", // Suy ra từ [cite: 138, 210]
    criteria: ["Truyền thống", "Ấm cúng", "Yên tĩnh", "Phù hợp gia đình", "Menu đa dạng", "Lý tưởng làm việc", "Cơm trưa"] // Suy ra từ [cite: 131, 132, 133, 134, 135, 147, 149]
  },
  {
    id: 7,
    name: "Country House Coffee", // [cite: 152]
    rating: 4.1, // [cite: 164]
    image: "assets/image/cfimg/countryhouse1.png",
    location_area: "Quận Gò Vấp", // [cite: 160]
    need: "Hẹn hò", // Suy ra từ [cite: 161, 200]
    criteria: ["Sân vườn", "Check-in sống ảo", "View đẹp", "Lãng mạn", "Wifi miễn phí", "Máy lạnh", "Ngoài trời", "Không gian riêng tư", "Menu đa dạng", "Cơm trưa", "Nhạc live", "Học nhóm"] // Suy ra từ [cite: 155, 157, 158, 159, 171, 172, 173]
  }
];

// Set global variable for carousel
window.coffeeShopsData = allCoffeeShops;
console.log('Coffee shops data loaded:', allCoffeeShops.length, 'shops');
// // Đây là mảng chứa tất cả dữ liệu quán cà phê của bạn
// // Dữ liệu được trích xuất và chuẩn hóa từ file Word
// const allCoffeeShops = [
//   {
//     id: 1,
//     name: "LAVA Coffee", // [cite: 3]
//     rating: 4.3, // [cite: 16]
//     image: "assets/image/cfimg/lava1.png",
//     location_area: "Quận Gò Vấp", // [cite: 11]
//     need: "Học tập", // Suy ra từ 
//     criteria: ["Wifi miễn phí", "Ổ cắm mỗi bàn", "Sân thượng", "View đẹp", "Vintage", "Máy lạnh"] // Suy ra từ [cite: 6, 7, 9, 10, 22]
//   },
//   {
//     id: 2,
//     name: "Du Miên Garden", // [cite: 27]
//     rating: 4.3, // [cite: 40]
//     image: "assets/image/cfimg/dumien1.png",
//     location_area: "Quận Gò Vấp", // [cite: 35]
//     need: "Gia đình", // Suy ra từ 
//     criteria: ["Ngoài trời", "Cây xanh", "Phù hợp gia đình", "Wifi mạnh", "Sân thượng", "Check-in sống ảo", "Ấm cúng"] // Suy ra từ [cite: 30, 31, 34, 47, 48]
//   },
//   {
//     id: 3,
//     name: "Saigon Chic", // [cite: 51]
//     rating: 4.4, // [cite: 64]
//     image: "assets/image/cfimg/saigonchic1.png",
//     location_area: "Quận Gò Vấp", // [cite: 59]
//     need: "Hẹn hò", // Suy ra từ [cite: 52, 200]
//     criteria: ["Ngoài trời", "View đẹp", "Cây xanh", "Đặt bàn trước", "Máy lạnh", "Wifi miễn phí", "Lý tưởng làm việc", "Lãng mạn", "Check-in sống ảo", "Gửi xe miễn phí", "WC sạch"] // Suy ra từ [cite: 54, 56, 57, 58, 71, 72, 73, 75]
//   },
//   {
//     id: 4,
//     name: "Thức Coffee", // [cite: 78]
//     rating: 4.1, // [cite: 92]
//     image: "assets/image/cfimg/thuc1.png",
//     location_area: "Quận Gò Vấp", // [cite: 86]
//     need: "Làm việc", // Suy ra từ [cite: 89, 204]
//     criteria: ["Wifi miễn phí", "Máy lạnh", "Gửi xe miễn phí", "Menu đa dạng", "View đường phố", "Yên tĩnh", "Lý tưởng làm việc", "24/7", "Ấm cúng"] // Suy ra từ [cite: 81, 82, 83, 84, 85, 99, 100, 101]
//   },
//   {
//     id: 5,
//     name: "Oasis Cafe", // [cite: 104]
//     rating: 4.8, // [cite: 117]
//     image: "assets/image/cfimg/oasis1.png",
//     location_area: "Quận Gò Vấp", // [cite: 112]
//     need: "Check-in / \"Sống ảo\"", // Suy ra từ [cite: 115, 212]
//     criteria: ["Sân vườn", "Phù hợp gia đình", "Menu đa dạng", "View đẹp", "Thân thiện", "Wifi miễn phí", "Máy lạnh", "Học nhóm", "Ngoài trời", "Phòng riêng", "Gửi xe miễn phí", "Lãng mạn", "Cây xanh", "Check-in sống ảo"] // Suy ra từ [cite: 107, 108, 109, 110, 111, 123, 124, 125]
//   },
//   {
//     id: 6,
//     name: "Cà phê Ngày xưa ấy", // [cite: 128]
//     rating: 4.4, // [cite: 140]
//     image: "assets/image/cfimg/ngayxuaay1.png",
//     location_area: "Quận Gò Vấp", // [cite: 136]
//     need: "Đọc sách", // Suy ra từ [cite: 138, 210]
//     criteria: ["Truyền thống", "Ấm cúng", "Yên tĩnh", "Phù hợp gia đình", "Menu đa dạng", "Lý tưởng làm việc", "Cơm trưa"] // Suy ra từ [cite: 131, 132, 133, 134, 135, 147, 149]
//   },
//   {
//     id: 7,
//     name: "Country House Coffee", // [cite: 152]
//     rating: 4.1, // [cite: 164]
//     image: "assets/image/cfimg/countryhouse1.png",
//     location_area: "Quận Gò Vấp", // [cite: 160]
//     need: "Hẹn hò", // Suy ra từ [cite: 161, 200]
//     criteria: ["Sân vườn", "Check-in sống ảo", "View đẹp", "Lãng mạn", "Wifi miễn phí", "Máy lạnh", "Ngoài trời", "Không gian riêng tư", "Menu đa dạng", "Cơm trưa", "Nhạc live", "Học nhóm"] // Suy ra từ [cite: 155, 157, 158, 159, 171, 172, 173]
//   }
// ];