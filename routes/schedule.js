const router = require('express').Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    // Delete horas.txt
    const pathHoras = path.join(path.resolve(__dirname, '..'), 'horas.txt')
    fs.truncateSync(pathHoras);

    const empieza8 = Boolean(Math.round(Math.random()));
    let hora = 0;

    if (empieza8) {
        hora = 8;
    } else {
        hora = 9;
    }

    while (hora < 23) {
        const minuto = Math.floor(Math.random() * 59);
        let textToWrite = `${pad(hora)}:${pad(minuto)}`;
        console.log(23 - hora);
        if ((23 - hora) > 2) textToWrite += '\n';
        fs.appendFileSync(pathHoras, textToWrite);
        hora += 2;
    }

    res.json('Fin del schedule')
})

function pad(num) {
    return ("0" + num).slice(-2);
}

module.exports = router;