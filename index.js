const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use('/submit', express.static(path.join(__dirname, 'api.jpo/submit')));

app.use('/admin', express.static(path.join(__dirname, 'api.jpo/admin')));

app.use('/', express.static(path.join(__dirname, 'api.jpo/register')));

const db = mysql.createConnection({
    host: 'mysql-jpoepitech.alwaysdata.net',
    user: '369894',
    password: 'jpoepitechnogeproductions2024',
    database: 'jpoepitech_jpo2024'
});

// const db = mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database: 'jpo'
//     });

db.connect((err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

db.query(`CREATE TABLE IF NOT EXISTS user (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) UNIQUE NOT NULL,
    players1 VARCHAR(255) UNIQUE NOT NULL,
    players2 VARCHAR(255) UNIQUE NOT NULL,
    players3 VARCHAR(255) UNIQUE NOT NULL,
    players4 VARCHAR(255) UNIQUE NOT NULL,
    players5 VARCHAR(255) UNIQUE NOT NULL,
    players6 VARCHAR(255) UNIQUE NOT NULL,
    players7 VARCHAR(255) UNIQUE NOT NULL,
    players8 VARCHAR(255) UNIQUE NOT NULL,
    players9 VARCHAR(255) UNIQUE NOT NULL,
    players10 VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`, (err, results) => {
    if (err) {
        console.error('Error creating user table', err);
    } else {
        console.log('User table created or already exists');
    }
});

db.query(`CREATE TABLE IF NOT EXISTS jeu (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    points BIGINT NOT NULL,
    answers TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_name) REFERENCES user(group_name)
)`, (err, results) => {
    if (err) {
        console.error('Error creating jeu table', err);
    } else {
        console.log('Jeu table created or already exists');
    }
});

db.connect((err) => {
    if (err) {
      console.error('Error : ' + err.stack);
      return;
    }
    console.log('Connected Succed to database as ID : ' + db.threadId);
  });

app.post('/register', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10 } = req.body;

    db.query(
        `SELECT * FROM user WHERE group_name = ? OR players1 = ? OR players2 = ? OR players3 = ? OR players4 = ? OR players5 = ? OR players6 = ? OR players7 = ? OR players8 = ? OR players9 = ? OR players10 = ?`,
        [group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10],
        (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length > 0) {
                return res.status(202).json({ msg: 'LE NOM DU JOUER OU DU GROUPE EXISTE DEJA | CONTACT YOUR ADMINISTRATOR' });
            }
            db.query(
                `INSERT INTO user (group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10],
                (err, results) => {
                    if (err) {
                        console.error('Database insertion error:', err);
                        return res.status(500).json({ msg: 'Database insertion error' });
                    }
                    db.query(
                        `INSERT INTO jeu (group_name, points, answers) VALUES (?, 0, '')`,
                        [group_name],
                        (err, results) => {
                            if (err) {
                                console.error('Database insertion error:', err);
                                return res.status(500).json({ msg: 'Database insertion error' });
                            }
                            res.status(200).json({ msg: 'GROUPE ENREGISTRE' });
                        }
                    );
                }
            );
        }
    );
});



app.post('/submit', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, reponse } = req.body;
    const validReponses = ['WEI', 'HUB', 'CAMPUS', 'CRYPTAGE', 'INTRUSION', 'QUEST', 'JAM', 'JAMES', 'ORACE'];

    if (!validReponses.includes(reponse)) {
        return res.status(202).json({ msg: 'Mauvaise Réponse' });
    }

    if (reponse === 'JAMES') {
        db.query(`SELECT * FROM jeu WHERE FIND_IN_SET('JAMES', answers)`, (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length > 16) {
                return res.status(200).json({ msg: 'Le mot "JAMES" a déjà été scanné par un autre groupe' });
            } else {
                processSubmission();
            }
        });
    } else {
        processSubmission();
    }

    function processSubmission() {
        db.query(`SELECT * FROM jeu WHERE group_name = ?`, [group_name], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length === 0) {
                return res.status(200).json({ msg: 'Nom du groupe Invalide' });
            } else {
                const user = results[0];
                const answersArray = user.answers ? user.answers.split(',') : [];

                if (answersArray.includes(reponse) && reponse !== 'ORACE') {
                    return res.status(200).json({ msg: 'Vous avez déjà soumis cette réponse' });
                } else {
                    if (reponse !== 'ORACE') {
                        answersArray.push(reponse);
                    }
                    const newAnswers = answersArray.join(',');
                    let a = 0;

                    if (reponse === 'WEI' || reponse === 'HUB' || reponse === 'CAMPUS') {
                        a = 150;
                    } else if (reponse === 'CRYPTAGE' || reponse === 'INTRUSION' || reponse === 'QUEST' || reponse === 'JAM' || reponse === 'JAMES') {
                        a = 100;
                    } else if (reponse === 'NON') {
                        a = -50;
                    } else if (reponse === 'FAUX' || reponse === 'ORACE') {
                        a = -100;
                    }

                    db.query(`UPDATE jeu SET points = points + ?, answers = ? WHERE group_name = ?`, [a, newAnswers, group_name], (err, results) => {
                        if (err) {
                            console.error('Database update error:', err);
                            return res.status(500).json({ msg: 'Database update error' });
                        }
                        res.status(200).json({ msg: `BONNE REPONSE VOUS OBTENEZ ${a} POUR LE GROUPE ${group_name}` });
                    });
                }
            }
        });
    }
});



app.get('/leaderboard', (req, res) => {
    db.query(`SELECT group_name, points FROM jeu ORDER BY points DESC`, [], (err, results) => {
        if (err) {
            return res.status(500).json({ msg: err.message });
        }
        res.status(200).json(results);
    });
});

app.get('/adminscore', (req, res) => {
    db.query(`SELECT group_name, points, answers FROM jeu ORDER BY points DESC`, [], (err, results) => {
        if (err) {
            return res.status(500).json({ msg: err.message });
        }
        res.status(200).json(results);
    });
});

app.post('/admin', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, reponse } = req.body;
    const validReponses = ['WEI', 'HUB', 'CAMPUS', 'CRYPTAGE', 'INTRUSION', 'QUEST', 'JAM', 'JAMES', 'ORACE', 'NON', 'FAUX'];

    if (!validReponses.includes(reponse)) {
        return res.status(202).json({ msg: 'Mauvaise Réponse' });
    }

    if (reponse === 'JAMES') {
        db.query(`SELECT * FROM jeu WHERE FIND_IN_SET('JAMES', answers)`, (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length > 0) {
                return res.status(200).json({ msg: 'Le mot "JAMES" a déjà été scanné par un autre groupe' });
            } else {
                processSubmission();
            }
        });
    } else {
        processSubmission();
    }

    function processSubmission() {
        db.query(`SELECT * FROM jeu WHERE group_name = ?`, [group_name], (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length === 0) {
                return res.status(200).json({ msg: 'Nom du groupe Invalide' });
            } else {
                const user = results[0];
                const answersArray = user.answers ? user.answers.split(',') : [];

                if (answersArray.includes(reponse) && reponse !== 'ORACE') {
                    return res.status(200).json({ msg: 'Vous avez déjà soumis cette réponse' });
                } else {
                    if (reponse !== 'ORACE') {
                        answersArray.push(reponse);
                    }
                    const newAnswers = answersArray.join(',');
                    let a = 0;

                    if (reponse === 'WEI' || reponse === 'HUB' || reponse === 'CAMPUS') {
                        a = 150;
                    } else if (reponse === 'CRYPTAGE' || reponse === 'INTRUSION' || reponse === 'QUEST' || reponse === 'JAM' || reponse === 'JAMES') {
                        a = 100;
                    } else if (reponse === 'NON') {
                        a = -50;
                    } else if (reponse === 'FAUX' || reponse === 'ORACE') {
                        a = -100;
                    }

                    db.query(`UPDATE jeu SET points = points + ?, answers = ? WHERE group_name = ?`, [a, newAnswers, group_name], (err, results) => {
                        if (err) {
                            console.error('Database update error:', err);
                            return res.status(500).json({ msg: 'Database update error' });
                        }
                        res.status(200).json({ msg: `BONNE REPONSE VOUS OBTENEZ ${a} POUR LE GROUPE ${group_name}` });
                    });
                }
            }
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
