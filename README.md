# appointDemo

## 需求：
这是一个预约功能，可以预约未来2天至7天，每天09:00 - 15:00之内每个小时可以预约6个服务。
1. 请设计一些数据结构来表达可预约项。
2. 请实现一个 GET API 用以读取全部可预约状态
3. 请实现一个 POST API 用以预约某个时间段的服务（可预约数量 -1），如果请求的时间段不能预约，则返回状态码 40x ，请在代码中说明 x 是多少以及为何选择该状态码。

### 数据库设计：
1. 采用的是mysql数据库
2. 数据库表在database文件中，导入到数据库test即可，appoint表记录预约的时间段和可预约数量，customer_appointment表用来记录用户预约信息。
3. 在connection.jsx文件中修改数据库信息

### 项目启动
1. npm install
2. npm start

### 单元测试：
1. 使用Postman工具
2. GET API: 选择GET请求，http://IP地址:5001/server/getAppoint
3. POST API: 选择POST请求，http://IP地址:5001/server/addAppoint.Body中填写信息，例如：
    {
        "dateFrom":"2020-02-19 14:00:00",
        "dateTo":"2020-02-19 15:00:00",
        "name":"XXX",
        "phone":"13723436786"
    }