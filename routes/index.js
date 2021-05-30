var express = require('express');
var router = express.Router();
var axios = require('axios');
var fs = require('fs');
var https = require('https');
axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false
})

/* GET home page. */
router.get('/', async function (req, res, next) {
  const {date, file, session} = req.query;
  var config = {
    method: 'get',
    url: `https://wmuat.kss.com.vn/getFile.kss?date=${date}&file=${file}`,
    headers: {
      'Cookie': `JSESSIONID=${session}.node0;Path=/; JSESSIONID=${session}.node0`,
      'Accept': 'application/json'
    },
    responseType: 'stream',
  };
  // Lấy dữ liệu ghi file vào hệ thống
  const response = await axios(config);
  var createFile = fs.createWriteStream(file)
  response.data.pipe(createFile);
  // Chạy vào khi hoàn tất tạo file
  response.data.on('end', () => {
    // Thực hiện đóng file để khi gửi file download file không bị empty
    createFile.close();
    // Thực hiện gửi file cho download
    res.download(file, file, (err) => {
      if (err) {
        res.status(500).send({
          message: "Could not download the file. " + err,
        });
      }
      // Xóa file sau khi download xong
      fs.unlinkSync(file);
    });
  });
  // Trường hợp tạo file lỗi
  response.data.on('error', function(err) {
    console.log(err);
    createFile.close();});
});

module.exports = router;
