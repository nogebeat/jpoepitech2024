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
    host: 'sql212.infinityfree.com',
    user: 'if0_36944326',
    password: 'JPOEPITECH2024',
    database: 'if0_36944326_jpo_test'
});

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
    password VARCHAR(255) NOT NULL,
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
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_name) REFERENCES user(group_name),
    FOREIGN KEY (password) REFERENCES user(password)
)`, (err, results) => {
    if (err) {
        console.error('Error creating jeu table', err);
    } else {
        console.log('Jeu table created or already exists');
    }
});

app.post('/register', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10, password } = req.body;

    db.query(
        `SELECT * FROM user WHERE group_name = ? OR players1 = ? OR players2 = ? OR players3 = ? OR players4 = ? OR players5 = ? OR players6 = ? OR players7 = ? OR players8 = ? OR players9 = ? OR players10 = ?`,
        [group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10],
        (err, results) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ msg: 'Database query error' });
            }
            if (results.length > 0) {
                return res.status(400).json({ msg: 'Group name or one of the player names already exists' });
            }
            db.query(
                `INSERT INTO user (group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [group_name, players1, players2, players3, players4, players5, players6, players7, players8, players9, players10, password],
                (err, results) => {
                    if (err) {
                        console.error('Database insertion error:', err);
                        return res.status(500).json({ msg: 'Database insertion error' });
                    }
                    db.query(
                        `INSERT INTO jeu (group_name, points, answers, password) VALUES (?, 0, '', ?)`,
                        [group_name, password],
                        (err, results) => {
                            if (err) {
                                console.error('Database insertion error:', err);
                                return res.status(500).json({ msg: 'Database insertion error' });
                            }
                            res.status(200).json({ msg: 'User registered' });
                        }
                    );
                }
            );
        }
    );
});



app.post('/submit', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, reponse, password } = req.body;
    const validReponses = ['JAMES', 'CHANCE', 'KENZO', 'MERYL', 'LESLY'];

    if (!validReponses.includes(reponse)) {
        return res.status(400).json({ msg: 'Invalid response' });
    }

    if (!password) {
        return res.status(400).json({ msg: 'Password is required' });
    }

    db.query(`SELECT * FROM jeu WHERE group_name = ? AND password = ?`, [group_name, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database query error' });
        }
        if (results.length === 0) {
            return res.status(400).json({ msg: 'Invalid group name or password' });
        } else {
            const user = results[0];
            const answersArray = user.answers ? user.answers.split(',') : [];

            if (answersArray.includes(reponse)) {
                return res.status(400).json({ msg: 'User already submitted this response' });
            } else {
                answersArray.push(reponse);
                const newAnswers = answersArray.join(',');
                let a = 0;

                if (reponse === 'JAMES') {
                    a = 50;
                } else if (reponse === 'CHANCE') {
                    a = 30;
                } else if (reponse === 'KENZO' || reponse === 'MERYL' || reponse === 'LESLY') {
                    a = 10;
                }

                db.query(`UPDATE jeu SET points = points + ?, answers = ? WHERE group_name = ?`, [a, newAnswers, group_name], (err, results) => {
                    if (err) {
                        console.error('Database update error:', err);
                        return res.status(500).json({ msg: 'Database update error' });
                    }
                    res.status(200).json({ msg: 'Response submitted and points updated' });
                });
            }
        }
    });
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
    db.query(`SELECT group_name, points, answers, password FROM jeu ORDER BY points DESC`, [], (err, results) => {
        if (err) {
            return res.status(500).json({ msg: err.message });
        }
        res.status(200).json(results);
    });
});

app.post('/admin', (req, res) => {
    console.log('Received data:', req.body);
    const { group_name, reponse } = req.body;
    const validReponses = ['JAMES', 'CHANCE', 'KENZO', 'MERYL', 'LESLY'];

    if (!validReponses.includes(reponse)) {
        return res.status(400).json({ msg: 'Invalid response' });
    }

            const user = results[0];
            const answersArray = user.answers ? user.answers.split(',') : [];

            if (answersArray.includes(reponse)) {
                return res.status(400).json({ msg: 'User already submitted this response' });
            } else {
                answersArray.push(reponse);
                const newAnswers = answersArray.join(',');
                let a = 0;

                if (reponse === 'JAMES') {
                    a = 50;
                } else if (reponse === 'CHANCE') {
                    a = 30;
                } else if (reponse === 'KENZO' || reponse === 'MERYL' || reponse === 'LESLY') {
                    a = 10;
                }

                db.query(`UPDATE jeu SET points = points + ?, answers = ? WHERE group_name = ?`, [a, newAnswers, group_name], (err, results) => {
                    if (err) {
                        console.error('Database update error:', err);
                        return res.status(500).json({ msg: 'Database update error' });
                    }
                    res.status(200).json({ msg: 'Response submitted and points updated' });
                });
            }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});