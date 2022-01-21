/*
 * @Descripttion:
 * @Author: Hehuan
 * @Date: 2021-06-09 17:07:27
 * @LastEditTime: 2022-01-21 09:20:06
 */
const axios = require("axios");
const dotenv = require("dotenv");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const LocalizedFormat = require("dayjs/plugin/localizedFormat");
const fundURL = "http://fundgz.1234567.com.cn/js/";
const fundDetailURL = "https://m.1234567.com.cn/index.html?page=jjxq&code=";
const qyweixinUrl = "https://qyapi.weixin.qq.com";

dayjs.extend(duration);
dayjs.extend(LocalizedFormat);

dotenv.config()

const { WX_COMPANY_ID, WX_APP_ID, WX_APP_SECRET } = process.env;

console.log({
  WX_COMPANY_ID,
  WX_APP_ID,
  WX_APP_SECRET,
});

const WEEKS = {
  1: "星期一",
  2: "星期二",
  3: "星期三",
  4: "星期四",
  5: "星期五",
  6: "星期六",
  0: "星期日",
};

const weekToday = () => {
  const week = dayjs().get("days");
  return WEEKS[week];
};

// 图文消息
const newsTemplate = (list) => {
  let articles = [];
  if (list && Array.isArray(list)) {
    articles = list.map((n) => {
      return {
        title: `${n.name} ${n.fundcode} ${n.gszzl > 0 ? '+'+n.gszzl+'%' : n.gszzl+'%'}`,
        description: ``,
        url: fundDetailURL + n.fundcode,
        picurl: "",
      };
    });
  }

  return {
    msgtype: "news",
    news: {
      articles,
    },
  };
};

//根据企业ID、应用secret 获取token
const getToken = async ({ id, secret }) => {
  try {
    const response = await axios({
      url: `${qyweixinUrl}/cgi-bin/gettoken?corpid=${id}&corpsecret=${secret}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.log(error);
    return "";
  }
};

//发送消息通知到企业微信
const postMsg = async (accessToken, config) => {
  const response = await axios({
    url: `${qyweixinUrl}/cgi-bin/message/send?access_token=${accessToken}`,
    method: "POST",
    data: {
      touser: config.touser || "@all",
      ...config,
    },
  });
  return response.data;
};

//微信消息通知
const wxNotify = async (config) => {
  try {
    // 获取token
    const accessToken = await getToken({
      id: WX_COMPANY_ID,
      secret: WX_APP_SECRET,
    });
    // 发送消息
    const defaultConfig = {
      msgType: "text",
      agentid: WX_APP_ID,
      ...config,
    };
    const option = { ...defaultConfig, ...config };
    const res = await postMsg(accessToken, option);
    console.log("wx:信息发送成功！", res);
    return true;
  } catch (error) {
    console.log("wx:信息发送失败！", error);
    return false;
  }
};

const getFundInfo = (fundCode) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${fundURL}${fundCode}.js`)
      .then((res) => {
        res.data ? resolve(res.data) : reject("error");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const scheduleTask2 = async () => {
  try {
    console.log("启动任务:" + new Date());
    var arr = [];

    let res1 = await getFundInfo("005918");
    console.log(res1);
    let data1 = JSON.parse(
      res1.substring(res1.indexOf("(") + 1, res1.lastIndexOf(")"))
    );
    arr.push(data1);
    let res2 = await getFundInfo("161726");
    let data2 = JSON.parse(
      res2.substring(res2.indexOf("(") + 1, res2.lastIndexOf(")"))
    );
    arr.push(data2);
    let res3 = await getFundInfo("161725");
    let data3 = JSON.parse(
      res3.substring(res3.indexOf("(") + 1, res3.lastIndexOf(")"))
    );
    arr.push(data3);
    let res4 = await getFundInfo("003096");
    let data4 = JSON.parse(
      res4.substring(res4.indexOf("(") + 1, res4.lastIndexOf(")"))
    );
    arr.push(data4);
    let res5 = await getFundInfo("001513");
    let data5 = JSON.parse(
      res5.substring(res5.indexOf("(") + 1, res5.lastIndexOf(")"))
    );
    arr.push(data5);
    let res6 = await getFundInfo("005827");
    let data6 = JSON.parse(
      res6.substring(res6.indexOf("(") + 1, res6.lastIndexOf(")"))
    );
    arr.push(data6);
    let res7 = await getFundInfo("003984");
    let data7 = JSON.parse(
      res7.substring(res7.indexOf("(") + 1, res7.lastIndexOf(")"))
    );
    arr.push(data7);
    let res8 = await getFundInfo("001875");
    let data8 = JSON.parse(
      res8.substring(res8.indexOf("(") + 1, res8.lastIndexOf(")"))
    );
    arr.push(data8);
    console.log(arr);
    let str = "";
    if (arr.length > 0) {
      const template = newsTemplate(arr);
      await wxNotify(template);
    }
  } catch (error) {
    console.error(error);
  }
};

// const week = weekToday();
// if (["星期六", "星期日"].includes(week)) {
//   console.log(week);
//   scheduleTask2();
// }else{
//   console.log(week,'have a rest')
// }

scheduleTask2();
