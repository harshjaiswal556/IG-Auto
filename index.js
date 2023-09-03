const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

const loginID = async (page) => {

    try {

        await page.waitForSelector('input[name="username"]');
        const username = await page.$('input[name="username"]');
        await username.type(process.env.USER_NAME);

        await page.waitForSelector('input[name="password"]');
        const password = await page.$('input[name="password"]');
        await password.type(process.env.PASSWORD);

        await page.waitForSelector('button[type="submit"]');
        await page.click('button[type="submit"]');

    } catch (error) {
        console.log(error);
    }

}

const saveLoginInfo = async (page) => {
    try {

        await page.waitForSelector('main div div ._ac8f div[role="button"]');
        await page.click('main div div ._ac8f div[role="button"]');

    } catch (error) {
        console.log(error);
    }
}

const notificationManager = async (page) => {
    const notification = "body > div.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div.x7r02ix.xf1ldfh.x131esax.xdajt7p.xxfnqb6.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe > div > div > div._a9-z > button._a9--._a9_1"

    const noti = await page.waitForSelector(notification, { timeout: 120000 });
    if (noti) {
        await page.click(notification);
    }
}

(async () => {

    try {

        const browser = await puppeteer.launch({
            headless: false,
        });

        const page = await browser.newPage();

        await page.setViewport({ width: 1528, height: 755 });
        await page.setDefaultNavigationTimeout(0);
        await page.goto("https://www.instagram.com/");

        loginID(page);

        saveLoginInfo(page);

        notificationManager(page);

        console.log("completed");

    } catch (error) {
        console.log(error);
    }

})();