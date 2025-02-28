/*
 * @Descripttion:
 * @Github: https://github.com/LovingMi/wxFundBot.git
 * @Author: Hehuan
 * @Date: 2021-06-09 17:07:27
 * @LastEditTime: 2025-02-07 14:37:52
 */
const axios = require("axios");
const util = require('./util');
const CONSTANT = require('./constant');

const {
  USER,
  FundURL,
  LargeMarketURL,
  QyWeixinUrl,
  FundObj,
  Day,
  Time,
  CurrentDate,
  ProcessEnv,
  WeekDays  
} = CONSTANT;

const {
  WX_COMPANY_ID,
  WX_APP_ID,
  WX_APP_SECRET
} = ProcessEnv;

const {
  sendMail,
} = util;

let upFundNum = 0;
let totalFundMoney = 0;

const markdownMsg = (data) => {
  const { list, upFundNum, totalFundMoney } = data;

  let markDown;
  if (list && Array.isArray(list)) {
    markDown = list
      .map((n) => {
        return `\n><font color=\"${n.gszzl > 0 ? "warning" : "info"}\">${n.gszzl > 0 ? "+" + n.gszzl + "%" : n.gszzl + "%"
          }</font> ${n.name}`;
      })
      .join("");
  }
  let str = `>**Fund Tips**
             ${markDown}
             上涨：<font color=\"warning\">${upFundNum}</font>
             下跌：<font color=\"info\">${list.length - upFundNum}</font>
             预估：<font color=\"${totalFundMoney > 0 ? "warning" : "info"}\">${totalFundMoney > 0
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
        return `\n${n.gszzl > 0 ? "+" + n.gszzl + "%" : n.gszzl + "%"} ${n.name
          }`;
      })
      .join("");
  }
  let description = `${fundstr}
上涨：${upFundNum}
下跌：${list.length - upFundNum}
预估：${totalFundMoney > 0
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

//根据企业ID、应用secret 获取token
const getToken = async ({ id, secret }) => {
  try {
    const response = await axios({
      url: `${QyWeixinUrl}/cgi-bin/gettoken?corpid=${id}&corpsecret=${secret}`,
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
    url: `${QyWeixinUrl}/cgi-bin/message/send?access_token=${accessToken}`,
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
      .get(`${FundURL}${fundCode}.js`)
      .then((res) => {
        res.data ? resolve(res.data) : reject("error");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getLargeMarketInfo = () => {
  const params = {
    fltt: 2,
    fields: 'f2,f3,f4,f12,f14',
    secids: '1.000001,0.399001,0.399006,1.000300,0.399005'
  }
  return new Promise((resolve, reject) => {
    axios.get(LargeMarketURL, {
      params: params
    }).then(res => {
      if (res.data) {
        resolve(res.data.data.diff)
      } else {
        resolve([])
      }
    }).catch(error => {
      reject(error)
    })
  })
}

const scheduleTask2 = async () => {
  try {
    console.log("启动任务:" + new Date());
    var arr = [];

    let res1 = await getFundInfo("005918");
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

    const trendList = await getLargeMarketInfo()

    if (arr.length > 0) {
      arr.forEach((ele) => {
        if (ele.gszzl > 0) {
          upFundNum += 1;
        }
        ele.salary = parseFloat(
          FundObj[ele.fundcode] * (ele.gsz - ele.dwjz).toFixed(2)
        );
        totalFundMoney += ele.salary * 1;
      });
      const data = {
        list: arr,
        upFundNum,
        totalFundMoney,
      };
      const textMsg = textcardMsg(data);
      const mkMsg = markdownMsg(data);
      await wxNotify(textMsg);
      await wxNotify(mkMsg);

      const html = `
        <div style="max-width: 800px; margin: 0 auto; color: #fff; line-height: 1.6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-sizing: border-box; padding: 10px 0px; background: linear-gradient(145deg, #1a1f2b, #0d111a); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
          <header style="text-align: center; padding: 30px 0; border-bottom: 2px solid rgba(76, 130, 255, 0.2); margin-bottom: 25px;">
            <h1 style="font-size: 2.0em; font-weight: 700; margin: 0; background: linear-gradient(90deg, #4c82ff, #6d5fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: 1px;">数字金融行情速递</h1>
          </header>
          <div style="margin: 25px 0; font-size: 0.8em; font-weight: 600;">
            ${trendList.map(item => {
              return `<div style="display: flex; justify-content: space-between; padding: 18px; margin: 12px 0; background: rgba(255,255,255,0.03); border-radius: 8px; transition: transform 0.3s ease;">
                        <div>
                          <span style="color: #4c82ff; font-weight: 600;">${item.f12}</span>
                          <span style="color: #aab2c0; margin-left: 15px;">${item.f14} ${item.f2}</span>
                        </div>
                        <div>
                          <span style="color: ${item.f3 > 0 ? "#ff5252" : "#00e676"};">${item.f4 > 0 ? `+${item.f4}` : `${item.f4}`}</span> 
                          <span style="color: ${item.f3 > 0 ? "#ff5252" : "#00e676"};">(${item.f3 > 0 ? `+${item.f3}`: `${item.f3}`}%)</span>
                        </div>
                      </div>`
            }).join('')}
            ${arr.map(item => {
              return `<div style="display: flex; justify-content: space-between; padding: 18px; margin: 12px 0; background: rgba(255,255,255,0.03); border-radius: 8px; transition: transform 0.3s ease;">
                        <div>
                          <span style="color: #4c82ff; font-weight: 600;">${item.fundcode}</span>
                          <span style="color: #aab2c0; margin-left: 15px;">${item.name}</span>
                        </div>
                        <div>
                          <span style="color: ${item.gszzl > 0 ? "#ff5252" : "#00e676"};">${item.gszzl > 0 ? `+${item.gszzl}` : `${item.gszzl}`}%</span> 
                        </div>
                      </div>`
            }).join('')}
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; background: rgba(76,130,255,0.1); border-radius: 8px; margin: 30px 0;">
            <div style="text-align: center;">
              <div style="color: #6d7a8f; font-size: 0.9em;">上涨基金</div>
              <div style="font-size: 1.4em; font-weight: 600; margin-top: 8px; color: #ff5252;">${upFundNum} 只</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #6d7a8f; font-size: 0.9em;">下跌基金</div>
              <div style="font-size: 1.4em; font-weight: 600; margin-top: 8px; color: #00e676;">${arr.length - upFundNum} 只</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #6d7a8f; font-size: 0.9em;">预估收益</div>
              <div style="font-size: 1.4em; font-weight: 600; margin-top: 8px;">¥${totalFundMoney.toFixed(2)}</div>
            </div>
          </div>
          <footer style="text-align: center; color: #6d7a8f; padding-top: 25px; font-size: 0.9em;">
            <p>© 2025 | 数据仅供参考，投资需谨慎</p>
            <p>数据更新于 ${Time}</p>
            <p>Powered by Dearhuan</p>
          </footer>
        </div>`;
      sendMail(
        USER,
        html,
        `【Fund Tips】By Github Actions`
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const isWeekend = [0, 6].includes(Day);

const isHoilday = WeekDays.some(item => {
  return item.date == CurrentDate
});

console.log(Day, isWeekend, CurrentDate, isHoilday);

!isWeekend && !isHoilday && scheduleTask2();