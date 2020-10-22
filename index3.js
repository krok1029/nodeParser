require("dotenv").config(); //載入.env環境檔
const db = require("./db_connect");

const webdriver = require("selenium-webdriver"), // 加入虛擬網頁套件
  By = webdriver.By, //你想要透過什麼方式來抓取元件，通常使用xpath、css
  until = webdriver.until; //直到抓到元件才進入下一步(可設定等待時間)

const chrome = require("selenium-webdriver/chrome");
const options = new chrome.Options();
options.setUserPreferences({
  "profile.default_content_setting_values.notifications": 1,
});

const path = require("path"); //用於處理文件路徑的小工具
const fs = require("fs"); //讀取檔案用

function checkDriver() {
  try {
    chrome.getDefaultService(); //確認是否有預設
  } catch {
    console.warn("找不到預設driver!");
    const file_path = "../chromedriver.exe"; //'../chromedriver.exe'記得調整成自己的路徑
    console.log(path.join(__dirname, file_path)); //請確認印出來日誌中的位置是否與你路徑相同
    if (fs.existsSync(path.join(__dirname, file_path))) {
      //確認路徑下chromedriver.exe是否存在
      const service = new chrome.ServiceBuilder(
        path.join(__dirname, file_path)
      ).build(); //設定driver路徑
      chrome.setDefaultService(service);
      console.log("設定driver路徑");
    } else {
      console.error("無法設定driver路徑");
      return false;
    }
  }
  return true;
}

async function parserStart() {
  if (!checkDriver()) {
    // 檢查Driver是否是設定，如果無法設定就結束程式
    return;
  }
  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build();
  const web = "http://www.langlangdontcry.com.tw/store-tp.php"; //要連的網頁
  await driver.get(web); //在這裡要用await確保打開完網頁後才能繼續動作

  await driver.sleep(3000);
  /**Parser  handle*/
  let name = "";
  let gender = "";
  let dogCat = "";
  let age = 0;
  let area = "";
  let address = "";
  let des = "";
  let Q1 = "是";
  let Q2 = "是";
  let Q3 = "是";
  let Q4 = "是";
  let Q5 = "是";
  let Q6 = "是";
  let Q7 = "是";
  let Q8 = "是";
  let Q9 = "是";
  let Q10 = "是";
  let Q11 = "是";
  let Q12 = "是";
  let Q13 = "是";

  for (let i = 1; i < 4; i++) {
    let url = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > div > h3`;
    //#cats > div > div > div:nth-child(1) > div.col-md-8.col-sm-12.col-xs-12 > div > div > h3
    name = await parserContext(driver, url);
    url = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(2)`;
    birth = await parserContext(driver, url);
    url = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(3)`;
    gender = await parserContext(driver, url);
    url = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(4)`;
    des = await parserContext(driver, url);
    dogCat = "cat";
    age = 2;
    area = "台北";
    address = "106台北市大安區復興南路一段317號";
    let sql = `INSERT INTO petInfo( name, gender, dogCat, age, area, address, des, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12, Q13)
    VALUES ('${name}','${gender}','${dogCat}','${age}','${area}','${address}','${des}','${Q1}','${Q2}','${Q3}','${Q4}','${Q5}','${Q6}','${Q7}','${Q8}','${Q9}','${Q10}','${Q11}','${Q12}','${Q13}')`;

    /**DB handle */
    console.log(sql);
    await db.query(sql).then(([results]) => {});
  }

  await driver.sleep(1000);
  await driver.quit();
}

parserStart();

async function parserContext(driver, url) {
  const card_eles = await driver.wait(until.elementLocated(By.css(url)));
  const text = await card_eles.getText();
  //   await console.log(text);
  return text;
}
