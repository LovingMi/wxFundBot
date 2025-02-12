const dotenv = require("dotenv");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");

dotenv.config();

const USER = "clearhuan@qq.com";
const PASS = "eouspdhfamtybbdd";
const FundURL = "http://fundgz.1234567.com.cn/js/";
const FundDetailURL = "https://m.1234567.com.cn/index.html?page=jjxq&code=";
const LargeMarketURL = "https://push2.eastmoney.com/api/qt/ulist.np/get"
const QyWeixinUrl = "https://qyapi.weixin.qq.com";
const CopyRight = `<p style="margin: 0;padding: 0; text-align:center; color: #ee55aa;font-size:15px; line-height: 80px;">copyright© Dearhuan 2020-2022 All Right Reserved</p>`;
const FundObj = {
  "005918": 11268.82,
  161726: 4922.62,
  161725: 7172.82,
  "003096": 575.96,
  "001513": 244.95,
  "005827": 1423.95,
  "003984": 1295.13,
  "001875": 1457.99,
};
// 25年节假日
const WeekDays = [
  {
    "date": "2025-01-01",
    "name": "元旦"
  },
  {
    "date": "2025-01-29",
    "name": "春节"
  },
  {
    "date": "2025-01-30",
    "name": "春节"
  },
  {
    "date": "2025-01-31",
    "name": "春节"
  },
  {
    "date": "2025-02-01",
    "name": "春节"
  },
  {
    "date": "2025-02-02",
    "name": "春节"
  },
  {
    "date": "2025-02-03",
    "name": "春节"
  },
  {
    "date": "2025-02-04",
    "name": "春节"
  },
  {
    "date": "2025-04-04",
    "name": "清明节"
  },
  {
    "date": "2025-05-01",
    "name": "劳动节"
  },
  {
    "date": "2025-05-02",
    "name": "劳动节"
  },
  {
    "date": "2025-05-03",
    "name": "劳动节"
  },
  {
    "date": "2025-05-04",
    "name": "劳动节"
  },
  {
    "date": "2025-05-05",
    "name": "劳动节"
  },
  {
    "date": "2025-06-02",
    "name": "端午节"
  },
  {
    "date": "2025-10-01",
    "name": "国庆"
  },
  {
    "date": "2025-10-02",
    "name": "国庆"
  },
  {
    "date": "2025-10-03",
    "name": "国庆"
  },
  {
    "date": "2025-10-04",
    "name": "国庆"
  },
  {
    "date": "2025-10-05",
    "name": "国庆"
  },
  {
    "date": "2025-10-06",
    "name": "国庆"
  },
  {
    "date": "2025-10-07",
    "name": "国庆"
  },
  {
    "date": "2025-10-08",
    "name": "国庆"
  }
]

module.exports = {
  Day: dayjs().day(),
  CurrentDate: dayjs().format('YYYY-MM-DD'),
  ProcessEnv: process.env,
  USER,
  PASS,
  FundURL,
  FundDetailURL,
  FundObj,
  LargeMarketURL,
  QyWeixinUrl,
  CopyRight,
  WeekDays
}