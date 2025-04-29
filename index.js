const express = require("express")
const bp = require("body-parser")
const cors = require("cors")
const sqlite3 = require("sqlite3")
const path = require("path")

const app = express()
const db = new sqlite3.Database("./db.sqlite")

var PORT = 3000

app.use(cors())
app.use(bp.urlencoded())
app.use(bp.json())
app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
    console.log("Servidor aberto na porta " + PORT)
})
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Quiz(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pergunta text,
            resposta1 text,
            resposta2 text,
            resposta3 text,
            resposta4 text,
            respostaCorreta text
        );
        
        `)
})
// db.get("SELECT COUNT(*) as count FROM Quiz", (err, row) => {
//     if (row.count === 0) {
//         db.run(`
//             INSERT INTO Quiz( pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
//             VALUES (?, ?, ?, ?, ?,?)`,
//             [
//                 "Qual o Time Brasileiro com mais títulos do Campeonato Mundial de Clubes?",
//                 "São Paulo", "Santos", "Corinthians", "Grêmio", "São Paulo"
//             ]
//         )
//     }
// })


app.get("/perguntas", (req, res) => {
    db.all(`SELECT *FROM Quiz`, [], (err, rows) => {
        res.json(rows)
        console.log(" aberto na porta " + PORT)
    })
})

app.post("/pergunta", (req, res) => {
    db.run(`
            INSERT INTO Quiz( pergunta, resposta1, resposta2, resposta3, resposta4, respostaCorreta)
            VALUES (?, ?, ?, ?, ?,?)`,
        [req.body.pergunta, req.body.resposta1,
        req.body.resposta2, req.body.resposta3,
        req.body.resposta4, req.body.respostaCorreta
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: "Tarefa adicionada com sucesso!" })
        })
})