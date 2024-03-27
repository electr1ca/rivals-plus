/* eslint-disable @typescript-eslint/no-unused-vars */
import * as fs from 'fs';
import { request } from 'undici'
let start = performance.now();

const list = JSON.parse(fs.readFileSync('../src/db/players.json'));

async function jsonfetch(url) {
    const {
        statusCode,
        headers,
        trailers,
        body
    } = await request(url)
    return body.json()
    //TODO: add error handling
    //this task is left to the viewer
}

async function jsonfetchP(url, data) {
    const {
        statusCode,
        headers,
        trailers,
        body
    } = await request(url, {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/json' // Ensure the server expects JSON data
        }
    });
    return body.json();
    // Remember to add error handling here
}


//im gonna try and make it look similar to your code
async function getScores() {
    const rpObj = {};
    for (const player in list) {
        const id = list[player].itl24;
        const body = await jsonfetch(`https://itl2024.groovestats.com/api/entrant/${id}`)
        const __ = await body.json()
        const rp = __.data.entrant.rankingPoints
        const rpd = __.data.entrant.rankingPointsDoubles
        rpObj[player] = [rp, rpd]
    }
    fs.writeFileSync(`../src/db/rp.json`, JSON.stringify(rpObj));
}

const main = async () => {
    console.log()

    //get every song here -> https://itl2024.groovestats.com/api/chart/list
    const players = JSON.parse(fs.readFileSync(`../src/db/players.json`));
    let db = [];

    const __ = await jsonfetch('https://itl2024.groovestats.com/api/chart/list')
    const charts = __.data
    let dbi = 0;
    for (const [i,chart] of charts.entries()) {
        console.log('-------------------------------------')
        console.log(chart.title)
        console.log('Chart '+i+' of '+charts.length)
        db[dbi] = {
            '_id': String(chart.id),
            '_title': String(chart.title),
            '_subtitle': String(chart.subtitle),
            '_diff': String(chart.meter),
            '_noCmod': String(chart.isNoCmod)
        };
        const __2 = await jsonfetchP(`https://itl2024.groovestats.com/api/score/chartTopScores`,JSON.stringify({"chartHash":chart.hash}))
        const leaderboard = __2.data.leaderboard
        for (const player in players) {
            try {
                let coolname = leaderboard.find(score => score.entrantId == players[player].itl24)
                if(coolname){
                    let score = Math.round(((coolname.points / chart.points)*100)*100)/100
                    db[dbi][player] = score
                    console.log(player+' has a score of '+score)
                }else{
                    true
                }
                
            } catch (error) {
                console.log(error)
            }
        }
        dbi++;
    }
    //console.log(db)
    console.log('')
    console.log('All done!!')
    fs.writeFileSync(`../src/db/db2.json`, JSON.stringify(db));
    let end = performance.now();
    console.log(`Script 1 took ${end - start} milliseconds`);

}
main()

getScores()
