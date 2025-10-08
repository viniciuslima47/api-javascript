const express = require('express');
const app = express();
const port = 3000;

let jogos = [];
let id = 1;

app.use(express.json());

// GET mostrar todos os jogos
app.get('/jogos', (req, res) => {
    res.json(jogos);
});

// GET quantidade de jogos
app.get('/jogos/quantidade', (req, res) => {
    res.json({ quantidade: jogos.length });
});

// GET mostrar o primeiro registro
app.get('/jogos/primeiro', (req, res) => {
    if (jogos.length === 0) {
        return res.status(404).json({ error: 'Nenhum jogo cadastrado' });
    }
    res.json(jogos[0]);
});

// GET último registro
app.get('/jogos/ultimo', (req, res) => {
    if (jogos.length === 0) {
        return res.status(404).json({ error: 'Nenhum jogo cadastrado' });
    }
    res.json(jogos[jogos.length - 1]);
});

// GET estatísticas dos jogos
app.get('/jogos/estatisticas', (req, res) => {
    if (jogos.length === 0) {
        return res.status(404).json({ error: 'Nenhum jogo cadastrado' });
    }

    const precos = jogos.map(j => parseFloat(j.preco));
    const soma = precos.reduce((acc, val) => acc + val, 0);
    const media = soma / precos.length;
    const minimo = Math.min(...precos);
    const maximo = Math.max(...precos);

    res.json({
        quantidade: jogos.length,
        mediaPreco: media.toFixed(2),
        precoMinimo: minimo.toFixed(2),
        precoMaximo: maximo.toFixed(2)
    });
});

// GET filtro com query params: precoMax, genero, plataforma
app.get('/jogos/filtro', (req, res) => {
    const { precoMax, genero, plataforma } = req.query;

    let jogosFiltrados = [...jogos];

    if (precoMax !== undefined) {
        const preco = parseFloat(precoMax);
        jogosFiltrados = jogosFiltrados.filter(j => parseFloat(j.preco) <= preco);
    }

    if (genero !== undefined) {
        jogosFiltrados = jogosFiltrados.filter(j => j.genero.toLowerCase() === genero.toLowerCase());
    }

    if (plataforma !== undefined) {
        jogosFiltrados = jogosFiltrados.filter(j => j.plataforma.toLowerCase().includes(plataforma.toLowerCase()));
    }

    if (jogosFiltrados.length === 0) {
        return res.status(404).json({ mensagem: 'Nenhum jogo encontrado com os filtros fornecidos.' });
    }

    res.json(jogosFiltrados);
});

// GET mostrar informações de um jogo específico pelo ID — esta rota deve ficar por último das rotas /jogos para evitar conflitos
app.get('/jogos/:id', (req, res) => {
    const jogoId = parseInt(req.params.id);
    const jogo = jogos.find(j => j.id === jogoId);

    if (!jogo) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    res.json(jogo);
});

// POST registrar um ou vários jogos
app.post('/jogos', (req, res) => {
    const jogosRecebidos = Array.isArray(req.body) ? req.body : [req.body];

    const novosJogos = jogosRecebidos.map(jogo => {
        const { nome, preco, genero, plataforma, desenvolvedora, datalancamento, idadereco } = jogo;
        return {
            id: id++,
            nome,
            preco,
            genero,
            plataforma,
            desenvolvedora,
            datalancamento,
            idadereco
        };
    });

    jogos.push(...novosJogos);
    res.status(201).json(novosJogos);
});

// PUT atualizar um jogo
app.put('/jogos/:id', (req, res) => {
    const jogoId = parseInt(req.params.id);
    const { nome, preco, genero, plataforma, desenvolvedora, datalancamento, idadereco } = req.body;

    const jogo = jogos.find(j => j.id === jogoId);

    if (!jogo) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    if (nome !== undefined) jogo.nome = nome;
    if (preco !== undefined) jogo.preco = preco;
    if (genero !== undefined) jogo.genero = genero;
    if (plataforma !== undefined) jogo.plataforma = plataforma;
    if (desenvolvedora !== undefined) jogo.desenvolvedora = desenvolvedora;
    if (datalancamento !== undefined) jogo.datalancamento = datalancamento;
    if (idadereco !== undefined) jogo.idadereco = idadereco;

    res.json(jogo);
});

// DELETE remover um jogo pelo ID
app.delete('/jogos/:id', (req, res) => {
    const jogoId = parseInt(req.params.id);
    const index = jogos.findIndex(j => j.id === jogoId);

    if (index === -1) {
        return res.status(404).json({ error: 'Jogo não encontrado' });
    }

    const jogoRemovido = jogos.splice(index, 1)[0];
    res.json({ mensagem: 'Jogo removido com sucesso', jogo: jogoRemovido });
});

app.listen(port, () => {
    console.log(`Servidor rodando: http://localhost:${port}`);
});
