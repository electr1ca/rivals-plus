import * as fs from 'fs';
import HTMLTableToJson from 'html-table-to-json';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const list = JSON.parse(fs.readFileSync('../src/db/players.json'));

const pause = async s => await new Promise(done => setTimeout(() => done(), s*1000));

const getScores = async page => {
    const rpObj = {};
    for (const player in list) {
        const id = list[player].itl24;
        let pageLimit = 1;
        for (let p = 1; p <= pageLimit; p++) {
            await page.goto(`https://itl2024.groovestats.com/entrant/${id}?page=${p}&clearType=1%2C2%2C3%2C4%2C5`);
            await pause(3.5);
            const scores = await page.evaluate(() => document.querySelector('.ant-table-body').innerHTML);
            if (p === 1) {
                pageLimit = Number(await page.evaluate(() => document.querySelector('.ant-pagination :nth-last-child(2) > a').innerHTML));
                const rpSingles = Number(await page.evaluate(() => document.querySelector(`.ant-space-vertical .ant-space-item:nth-child(2) article:nth-child(2)`).innerHTML));
                await page.click('.ant-switch')
                await pause(0.5);
                const rpDoubles = Number(await page.evaluate(() => document.querySelector(`.ant-space-vertical .ant-space-item:nth-child(2) article:nth-child(2)`).innerHTML));
                rpObj[player] = [rpSingles, rpDoubles];
                console.log(player, rpSingles, rpDoubles);
            }
            fs.writeFileSync(`html/${player}.${p}.html`, scores);
        }
    }
    fs.writeFileSync(`../src/db/rp.json`, JSON.stringify(rpObj));
};

const main = async () => {

    const get = false;

    // grab each html file
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.setViewport({width: 1000, height: 950});

    // delete old /html content + rp.json
    if (get) {
        fs.readdirSync('html').forEach(file => fs.unlinkSync(`html/${file}`));
        fs.unlinkSync(`../src/db/rp.json`);
        await getScores(page);
    }

    // fill db with relevant players
    const rpList = JSON.parse(fs.readFileSync(`../src/db/rp.json`));
    let db = {diff: {}, title: {}, subtitle: {}, noCmod: {}};
    for (const player in rpList) {
        db[player] = {};
    }

    // parse out ex score, title, difficulty  (list of unlocks later?)
    const files = fs.readdirSync('html');
    files.forEach(file => {
        const player = file.split('.')[0];
        const data = fs.readFileSync(`html/${file}`, 'utf-8');
        const [res] = HTMLTableToJson.parse(data).results;
        const $ = cheerio.load(data);
        res.forEach((song, i) => {
            const title         = song['4'].split('  ')[0].split(' 🚫')[0]
            const subtitle      = song['4'].split(/\s{2}|\s🚫/).length > 1 ? song['4'].split(/\s{2}|\s🚫/)[1] : null;
            const diff          = song['5'];
            const noCmod        = song['4'].includes('🚫');
            const [id]          = $(`tr.ant-table-row:nth-child(${i+2}) > td:nth-child(4) a`).attr('href').match(/\d+/g);
            db['title'][id]     = title;
            db['subtitle'][id]  = subtitle;
            db['diff'][id]      = diff;
            db['noCmod'][id]    = noCmod;
            [db[player][id]]    = song['2'].match(/\d+\.\d+/g);
        })
    });

    const dbCopy = [];
    let dbi = 0;
    for (const song in db.title) {
        dbCopy[dbi] = {
            '_id':          song,
            '_title':       db.title[song],
            '_subtitle':    db.subtitle[song],
            '_diff':        db.diff[song],
            '_noCmod':      db.noCmod[song],
        };
        for (const player in list) {
            dbCopy[dbi][player] = db[player][song];
        }
        dbi++;
    }

    // output to file
    fs.writeFileSync(`../src/db/db.json`, JSON.stringify(dbCopy));
    // eslint-disable-next-line no-undef
    process.exit(0);
}

main();