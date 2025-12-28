# HITer-Campus-Card-Yearly-Report
- 一个复制到浏览器控制台，自动抓取校园卡流水，在 Console 里生成年度总结的小脚本。
- 灵感来自“年度报告”，完全在本地浏览器执行，不上传数据、不需要后端服务。

> 支持：就餐/巴士等消费分类、月度趋势、三餐画像、Top 商户、最早早餐/最晚晚餐等  
> 仅在你已登录校园卡系统并能看到流水的前提下工作

##  Features

- **自动捕获** `GetPersonTrjn`（XHR）返回的 JSON 流水数据
- **本地运行**：数据只存在浏览器内存 `window.allCanteenData`，不会自动上传
- **一键报告**：输入 `report()` 输出年度总结
- 基础统计：
  - 年度就餐天数 / 次数 / 总支出 / 日均
  - 月度消费条形趋势（ASCII）
  - 三餐：次数、餐均、平均饭点（平均刷卡时间）
  - 年度常去商户 Top 5
  - 探店足迹（不同商户数量）+ 简易关键词
  - 校园巴士：年度次数、峰值乘车时段、最晚一次乘车时间


##  How it works 

脚本通过重写 `XMLHttpRequest.prototype.open`，监听页面发起的 XHR 请求；  
当 URL 包含 `GetPersonTrjn` 时，解析 `responseText` 中的 `rows` 并缓存到 `Map` 中（以 `RO` 去重）。  
随后用 `report()` 对缓存数据做分类与统计，并在 Console 里打印“年度报告”。

> 说明：此脚本不会绕过登录，不会破解加密，不会自动获取你的账号信息。  
> 它只是在**你自己浏览器里**读取你已经能看到的接口返回数据。

---
##  Quick Start

### 1) 打开校园卡流水页面并登录

https://xyk.hit.edu.cn/

进入校园卡系统，打开流水信息，选择时间范围并点击查询。
<img width="1240" height="880" alt="1 流水" src="https://github.com/user-attachments/assets/dcca6039-f5ac-4cce-aab5-57451f801419" />

### 2) 运行脚本

F12 打开开发者工具，切换到 **控制台**。

点击 top 切换到 comepage

<img width="1534" height="960" alt="2 comepage" src="https://github.com/user-attachments/assets/230324d9-c317-4240-a457-fc2e35adaf67" />

将 `hiter-report.js`完整粘贴到 Console 回车执行。

你会看到提示：“请翻页采集数据”、“完成后输入 report()”

<img width="654" height="375" alt="3 翻页" src="https://github.com/user-attachments/assets/6cd03596-7fc3-4175-b8f9-138c738d4b5f" />

### 3) 翻页采集

建议更改为每页显示100条信息，开始翻页。

每翻一次，Console 会提示已捕获多少条流水。

<img width="1525" height="834" alt="4 100" src="https://github.com/user-attachments/assets/523fa62f-cdc5-404b-9a8f-c2b8f0198727" />

### 4) 生成年度报告

在 Console 输入：

report()

<img width="621" height="769" alt="5 report1" src="https://github.com/user-attachments/assets/d2b63a7f-38f8-4ae9-88d8-2effa55ff4e9" />
<img width="610" height="584" alt="6 report2" src="https://github.com/user-attachments/assets/73b277c7-67e3-488e-8b70-24f409ca684d" />

### 统计口径
**简单分类：**
MERCNAME 包含 “车载POS” → 记为巴士；
包含 “深澜/网费” → 记为网费；
其余 → 默认饮食；

**三餐时段：**
早餐：05:00–10:30；
午餐：10:30–15:30；
晚餐：16:00–22:00；

### 合规声明

本项目仅用于个人数据统计与可视化学习交流。

运行前提是你**已合法登录**并拥有查看该数据的权限。

脚本**不会上传**你的数据；但浏览器控制台中显示的内容属于敏感信息，请谨慎在公开场合展示截图。

请**遵守学校信息系统使用规范与相关法律法规**。作者不对滥用负责。

### TODO

考虑做一个更美观的 HTML 报告
