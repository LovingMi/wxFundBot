/*
 * @Descripttion:
 * @Author: Hehuan
 * @Date: 2021-06-09 17:07:27
 * @LastEditTime: 2022-04-01 09:07:31
 */
const axios = require("axios");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const user = "clearhuan@qq.com";
const pass = "eouspdhfamtybbdd";
const fundURL = "http://fundgz.1234567.com.cn/js/";
const fundDetailURL = "https://m.1234567.com.cn/index.html?page=jjxq&code=";
const qyweixinUrl = "https://qyapi.weixin.qq.com";
const copyRight = `<p style="margin: 0;padding: 0; text-align:center;background: #000; color: #fff;font-size:15px; line-height: 80px;">copyright© Dearhuan 2020-2022 All Right Reserved</p>`;
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Shanghai");

dotenv.config();

const { WX_COMPANY_ID, WX_APP_ID, WX_APP_SECRET } = process.env;

const fundObj = {
  "005918": 11268.82,
  161726: 4922.62,
  161725: 7172.82,
  "003096": 575.96,
  "001513": 244.95,
  "005827": 1423.95,
  "003984": 1295.13,
  "001875": 1457.99,
};

let upFundNum = 0;
let totalFundMoney = 0;

const markdownMsg = (data) => {
  const { list, upFundNum, totalFundMoney } = data;

  let markDown;
  if (list && Array.isArray(list)) {
    markDown = list
      .map((n) => {
        return `\n><font color=\"${n.gszzl > 0 ? "warning" : "info"}\">${
          n.gszzl > 0 ? "+" + n.gszzl + "%" : n.gszzl + "%"
        }</font> ${n.name}`;
      })
      .join("");
  }
  let str = `>**Fund Tips**
             ${markDown}
             上涨：<font color=\"warning\">${upFundNum}</font>
             下跌：<font color=\"info\">${list.length - upFundNum}</font>
             预估：<font color=\"${totalFundMoney > 0 ? "warning" : "info"}\">${
    totalFundMoney > 0
      ? "+￥" + totalFundMoney.toFixed(2)
      : "￥" + totalFundMoney.toFixed(2)
  }</font>
             `;
  return {
    msgtype: "markdown",
    markdown: {
      content: str,
    },
  };
};

const textcardMsg = (data) => {
  const { list, upFundNum, totalFundMoney } = data;
  let fundstr;
  if (list && Array.isArray(list)) {
    fundstr = list
      .map((n) => {
        return `\n${n.gszzl > 0 ? "+" + n.gszzl + "%" : n.gszzl + "%"} ${
          n.name
        }`;
      })
      .join("");
  }
  let description = `${fundstr}
上涨：${upFundNum}
下跌：${list.length - upFundNum}
预估：${
    totalFundMoney > 0
      ? "+￥" + totalFundMoney.toFixed(2)
      : "￥" + totalFundMoney.toFixed(2)
  }`;
  const title = `Fund Tips`;

  return {
    msgtype: "textcard",
    textcard: {
      title,
      description,
      url: `https://api.vvhan.com/api/60s`,
      btntxt: "详情",
    },
  };
};

let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 587,
  secure: false,
  auth: {
    user: user,
    pass: pass,
  },
});

const sendMail = (transporter, to, htmlData, subject) => {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: `<${user}>`,
      to: `<${to}>`,
      subject: subject,
      html: htmlData,
    };
    transporter.sendMail(mailOptions, (error, info = {}) => {
      if (error) {
        console.error("邮件发送异常" + error);
        reject(error);
      } else {
        console.log("邮件发送成功", info.messageId);
        console.log("静等下一次发送");
        resolve();
      }
    });
  });
};

const randomRgbaColor = () => {
  //随机生成RGBA颜色
  var r = Math.floor(Math.random() * 256); //随机生成256以内r值
  var g = Math.floor(Math.random() * 256); //随机生成256以内g值
  var b = Math.floor(Math.random() * 256); //随机生成256以内b值
  var alpha = Math.random(); //随机生成1以内a值
  return `rgb(${r},${g},${b},${alpha})`; //返回rgba(r,g,b,a)格式颜色
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
      arr.forEach((ele) => {
        if (ele.gszzl > 0) {
          upFundNum += 1;
        }
        ele.salary = parseFloat(
          fundObj[ele.fundcode] * (ele.gsz - ele.dwjz).toFixed(2)
        );
        totalFundMoney += ele.salary * 1;

        str += `<div style="display:flex;justify-content:space-between;align-items:center;">
                <p style="width:330px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span style="margin:0 15px;font-size:16px;font-weight:700;color:#f26d5f">${
                  ele.fundcode
                }</span><a style="color:#0089ff;text-decoration: none;" href="${
          fundDetailURL + ele.fundcode
        }" target="_blank">${ele.name}</a></p>
                <p style="color:${
                  ele.gszzl > 0 ? "red" : "green"
                };margin-right:15px">${ele.gszzl}%</p>
              </div>`;
      });
      const data = {
        list: arr,
        upFundNum,
        totalFundMoney,
      };
      console.log(data);
      // const template = newsTemplate(data);
      const textMsg = textcardMsg(data);
      const mkMsg = markdownMsg(data);
      await wxNotify(textMsg);
      await wxNotify(mkMsg);

      const mStr = `<div style="display: flex;justify-content: space-evenly;align-items: center;">
                      <p>
                        上涨：<span style="color: red;">${upFundNum}</span>
                      </p>
                      <p>
                        下跌：<span style="color: green;">${arr.length - upFundNum}</span>
                      </p>
                      <p>预估：<span style="color: ${totalFundMoney > 0 ? "red" : "green"};">${(totalFundMoney).toFixed(2)}CNY</span></p>
                    </div>`;

      let msg = `<div style="background: linear-gradient(208deg, #ac1bfd, transparent);box-shadow: ${randomRgbaColor()} 0px 0px 10px;">
                  <div style="
                  font-weight: bold;
                  color: #fff;
                  text-align: center;
                  padding: 20px;
                  background: #000;fff
                  font-size: 20px;">基金涨跌幅统计</div>
                  ${str}
                  ${mStr}
                  ${copyRight}
                </div>`;
      sendMail(
        transporter,
        "clearhuan@qq.com",
        msg,
        `【基金涨跌幅统计】By Github Actions`
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const day = dayjs().day();
console.log("what day is it today?", day);

if (![0, 6].includes(day)) {
  scheduleTask2();
}
