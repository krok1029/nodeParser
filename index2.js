require("dotenv").config(); //載入.env環境檔

//取出.env檔案填寫的FB資訊
const fb_username = process.env.FB_USERNAME;
const fb_userpass = process.env.FB_PASSWORD;

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

async function loginFacebookGetTrace() {
  if (!checkDriver()) {
    // 檢查Driver是否是設定，如果無法設定就結束程式
    return;
  }

  let driver = await new webdriver.Builder()
    .forBrowser("chrome")
    .withCapabilities(options)
    .build(); // 建立這個browser的類型
  const web = "http://www.meetpets.org.tw/pets/cat"; //我們要前往FB
  await driver.get(web); //在這裡要用await確保打開完網頁後才能繼續動作

  await driver.sleep(3000);

  const card_eles = await driver.wait(
    until.elementLocated(
      By.xpath(`//*[@id="content-inner"]/div[4]/div[2]/div/ul/li[1]`)
    )
  );
  for (let i = 1; i < 47; i++) {
    let url = `//*[@id="content-inner"]/div[4]/div[2]/div/ul/li[${i}]`;
    const card_eles = await driver.wait(until.elementLocated(By.xpath(url)));
    const _text = await card_eles.getText();
    await console.log(_text);
  }

  //   const fb_trace_eles = await driver.wait(
  //     until.elementsLocated(By.xpath(fb_trace_path))
  //   );
  //   for (const card_ele of card_eles) {
  //     const card_context = await card_ele.getText();
  //     console.log(card_context);
  //     // if (card_context.includes("人在追蹤")) {
  //     //   fb_trace = fb_text;
  //     //   break;
  //     // }
  //   }
  driver.quit();
}
loginFacebookGetTrace(); //登入FB取得追蹤者資訊
