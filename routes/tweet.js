const Twit = require('twit')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone)
const relativeTime = require('dayjs/plugin/relativeTime')
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const Jimp = require('jimp');

const router = require('express').Router();

require('dotenv').config();

require('dayjs/locale/es')
dayjs().locale('es').format()

dayjs.extend(relativeTime)

const seconds100x100 = 432000;

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,
    strictSSL: true,
})

router.get('/', async (req, res) => {
    const pathHoras = path.join(path.resolve(__dirname, '..'), 'horas.txt')
    /**
     * ¿Frase?
     */
    const conFrase = (Math.random() < 0.2) ? true : false;
    console.log(conFrase);

    /**
    * OBTENCIÓN HORA
    */
    const horaActual = dayjs().tz("Europe/Madrid").format('HH:mm').toString();
    console.log(horaActual);

    const contentHoras = fs.readFileSync(pathHoras).toString();
    const horasDisponibles = contentHoras.split('\n');
    if (horasDisponibles.includes(horaActual)) {
        console.log('Envía Tweet');
        createTweet(conFrase);
    } else {
        console.log('NO Envía Tweet');
    }

    // PRUEBA
    const nextSaturday = dayjs(nextDate(6)).hour(0).minute(0).second(1).millisecond(0);

    let hours = nextSaturday.diff(dayjs(), 'hours');
    const days = Math.floor(hours / 24);
    hours = hours - (days * 24);

    console.log('Days: ', days);
    console.log('Hours: ', hours);

    const image = await Jimp.read('./public/images/banner.png');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    image.print(font, 529, 224, 'Hello World!');
    await image.write('./public/images/banner_f.png');

    // FIN PRUEBA

    res.json('Termina tweet')
});

function createTweet(conFrase = false) {
    /**
     * CREACIÓN DE LA BARRA
     */
    const nextSaturday = dayjs(nextDate(6)).hour(0).minute(0).second(1).millisecond(0);

    const seconds = nextSaturday.diff(dayjs(), 'second');
    const percent = Math.floor((seconds100x100 - seconds) * 100 / seconds100x100);
    const positiveBars = Math.round((percent * 15) / 100);
    const negativeBars = 15 - positiveBars;

    console.log(positiveBars, negativeBars);

    let bar = '█'.repeat(positiveBars) + '░'.repeat(negativeBars) + ` ${percent} % `;
    // let bar = '█████████';

    //▓
    /**
     * OBTENCIÓN DE FRASE
     */
    let fileSelected = '';
    if (percent < 15) {
        fileSelected = 'inicio.txt';
    } else if (percent >= 15 && percent < 70) {
        fileSelected = 'medio.txt';
    } else if (percent >= 70 && percent < 90) {
        fileSelected = 'final.txt';
    } else if (percent >= 90 && percent < 100) {
        fileSelected = 'inminente.txt'
    }


    const content = fs.readFileSync(path.join(path.resolve(__dirname, '..'), 'phrases', fileSelected)).toString();
    const phrases = content.split('\n');
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];

    let status = `Esto es lo que llevas de semana: \n${bar}`;
    if (conFrase) {
        status += `\n\n${phrase}`;
    }
    status += `\n\n#YaEsFinDeSemana`;

    T.post('statuses/update', {
        status: status
    }, function (err, data, response) {
        console.log(data)
        axios.post('https://maker.ifttt.com/trigger/yaesfindesemana_sent/with/key/cniitvUyoM44HB1UY9ShQC', {
            value1: data.id_str,
            value2: data.text,
            value3: `https://twitter.com/YaEsFinDeSemana/status/${data.id_str}`
        }).then(response => console.log(response.data));
    })
}

function nextDate(dayIndex) {
    var today = new Date();
    today.setDate(today.getDate() + (dayIndex - 1 - today.getDay() + 7) % 7 + 1);
    return today;
}

function pad(num) {
    return ("0" + num).slice(-2);
}

module.exports = router;