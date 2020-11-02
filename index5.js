require("dotenv").config(); //載入.env環境檔
const db = require("./db_connect");

const request = require("request");
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

let i = 1;
let x = 0;
let web = "http://www.langlangdontcry.com.tw/store-tp.php"; //要連的網頁

async function parserStart() {
  if (!checkDriver()) {
    // 檢查Driver是否是設定，如果無法設定就結束程式
    return;
  }
  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build();

  await gotoMainPage(driver);
  let stop = false;
  let url = "";
  let context = "";
  let last = `#dogs > div > div > div:nth-last-child(1)`;
  let lastContext = await parserContext(driver, last);

  //dog
  while (!stop) {
    url = `#dogs > div > div > div:nth-child(${i})`;
    context = await parserContext(driver, url);
    if (lastContext == context) {
      let detailUrl = `#dogs > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(5) > a`;
      await gotoDetailPage(driver, detailUrl);
      output = await parserDeatil(driver);
      i++;
      await gotoMainPage(driver);
      stop = true;
      console.log("end!!!");
    } else {
      let detailUrl = `#dogs > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(5) > a`;
      await gotoDetailPage(driver, detailUrl);
      output = await parserDeatil(driver);
      i++;
      await gotoMainPage(driver);
    }
  }
  await gotoDetailPage(
    driver,
    `body > section.about-area.pt-30.pb-100.bg-light > div > div > div > div > div > div.section-tab-menu.text-center > ul > li:nth-child(2) > a`
  );
  i = 1;
  stop = false;

  last = `#cats > div > div > div:nth-last-child(1)`;
  lastContext = await parserContext(driver, last);
  //cat
  while (!stop) {
    let urlc = `#cats > div > div > div:nth-child(${i})`;
    await driver.sleep(500);
    context = await parserContext(driver, urlc);
    if (lastContext == context) {
      let detailUrl = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(5) > a`;
      await gotoDetailPage(driver, detailUrl);
      output = await parserDeatil(driver);
      i++;
      await gotoMainPage(driver);
      stop = true;
      console.log("end!!!");
    } else {
      let detailUrl = `#cats > div > div > div:nth-child(${i}) > div.col-md-8.col-sm-12.col-xs-12 > div > p:nth-child(5) > a`;
      await gotoDetailPage(driver, detailUrl);
      output = await parserDeatil(driver);
      i++;
      await gotoMainPage(driver);
      gotoDetailPage(
        driver,
        `body > section.about-area.pt-30.pb-100.bg-light > div > div > div > div > div > div.section-tab-menu.text-center > ul > li:nth-child(2) > a`
      );
    }
  }

  await console.log("out of while2");
  /*
   */
  await driver.sleep(1000);
  await driver.quit();
}

parserStart();

async function parserContext(driver, url) {
  const eles = await driver.wait(until.elementLocated(By.css(url)));
  const text = await eles.getText();
  return text;
}
async function parserPicUrl(driver, url) {
  const eles = await driver.wait(
    until.elementLocated(
      By.css(
        `body > section.about-area.pt-80.pb-30.bg-light > div > div:nth-child(1) > div:nth-child(1) > div > div > img`
      )
    )
  );
  const text = await eles.getAttribute("src");
  await console.log(text);
  return text;
}

async function gotoMainPage(driver) {
  await driver.get(web); //在這裡要用await確保打開完網頁後才能繼續動作
  await driver.sleep(3000);
}
async function gotoDetailPage(driver, url) {
  const elem = await driver.wait(until.elementLocated(By.css(url)));
  await driver.sleep(500);
  elem.click();
  await driver.sleep(3000);
}
async function parserDeatil(driver) {
  /**parser detail text */
  let item = `body > section.about-area.pt-80.pb-30.bg-light > div > div:nth-child(1) > div:nth-child(2) > div`;
  let output = await parserContext(driver, item);

  /** */
  let picUrl = `body > section.about-area.pt-80.pb-30.bg-light > div > div:nth-child(1) > div:nth-child(1) > div > div > img`;
  let url = await parserPicUrl(driver, picUrl);
  await downloadPic(url, x);
  x++;
  return output;
}
async function downloadPic(url, path) {
  const download = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url).pipe(fs.createWriteStream(path)).on("close", callback);
    });
  };
  const filePath = `./images/${path}.jpg`;

  await download(url, filePath, () => {
    console.log("✅ Done!");
  });
  return 0;
}
