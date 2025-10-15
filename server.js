const express = require('express');
const app = express();
const port = 3000;

let livros = [
    { id: 1, titulo: "O Senhor dos Anéis", autor: "J.R.R. Tolkien", ano: 1954, paginas: 1178, lido: true },
    { id: 2, titulo: "Harry Potter", autor: "J.K. Rowling", ano: 1997, paginas: 223, lido: false }
];
let id = 3;

app.use(express.json());

// 1. GET mostrar todos os livros
app.get('/livros', (req, res) => {
    res.json(livros);
});

// 2. GET quantidade de livros
app.get('/livros/quantidade', (req, res) => {
    res.json({ quantidade: livros.length });
});

// 3. GET mostrar o primeiro registro
app.get('/livros/primeiro', (req, res) => {
    if (livros.length === 0) {
        return res.status(404).json({ error: 'Nenhum livro cadastrado' });
    }
    res.json(livros[0]);
});

// 4. GET último registro
app.get('/livros/ultimo', (req, res) => {
    if (livros.length === 0) {
        return res.status(404).json({ error: 'Nenhum livro cadastrado' });
    }
    res.json(livros[livros.length - 1]);
});

// 5. GET estatísticas dos livros
app.get('/livros/estatisticas', (req, res) => {
    if (livros.length === 0) {
        return res.status(404).json({ error: 'Nenhum livro cadastrado' });
    }

    const paginas = livros.map(l => l.paginas);
    const somaPaginas = paginas.reduce((acc, val) => acc + val, 0);
    const mediaPaginas = somaPaginas / paginas.length;
    const minimoPaginas = Math.min(...paginas);
    const maximoPaginas = Math.max(...paginas);
    
    const livrosLidos = livros.filter(l => l.lido).length;
    const porcentagemLidos = (livrosLidos / livros.length) * 100;

    res.json({
        quantidade: livros.length,
        mediaPaginas: mediaPaginas.toFixed(1),
        menorLivro: minimoPaginas,
        maiorLivro: maximoPaginas,
        livrosLidos: livrosLidos,
        porcentagemLidos: porcentagemLidos.toFixed(1) + '%'
    });
});

// 6. GET filtro (agora para livros)
app.get('/livros/filtro', (req, res) => {
    const { autor, lido, minPaginas } = req.query;

    let livrosFiltrados = [...livros];

    if (autor !== undefined) {
        livrosFiltrados = livrosFiltrados.filter(l => 
            l.autor.toLowerCase().includes(autor.toLowerCase())
        );
    }

    if (lido !== undefined) {
        const estaLido = lido === 'true';
        livrosFiltrados = livrosFiltrados.filter(l => l.lido === estaLido);
    }

    if (minPaginas !== undefined) {
        const paginas = parseInt(minPaginas);
        livrosFiltrados = livrosFiltrados.filter(l => l.paginas >= paginas);
    }

    if (livrosFiltrados.length === 0) {
        return res.status(404).json({ mensagem: 'Nenhum livro encontrado com os filtros fornecidos.' });
    }

    res.json(livrosFiltrados);
});

// 7. GET mostrar informações de um livro específico pelo ID
app.get('/livros/:id', (req, res) => {
    const livroId = parseInt(req.params.id);
    const livro = livros.find(l => l.id === livroId);

    if (!livro) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json(livro);
});

// 8. POST registrar um ou vários livros
app.post('/livros', (req, res) => {
    const livrosRecebidos = Array.isArray(req.body) ? req.body : [req.body];

    const novosLivros = livrosRecebidos.map(livro => {
        const { titulo, autor, ano, paginas, lido } = livro;
        return {
            id: id++,
            titulo,
            autor,
            ano: ano || new Date().getFullYear(),
            paginas: paginas || 0,
            lido: lido || false
        };
    });

    livros.push(...novosLivros);
    res.status(201).json(novosLivros);
});

// 9. PUT atualizar um livro
app.put('/livros/:id', (req, res) => {
    const livroId = parseInt(req.params.id);
    const { titulo, autor, ano, paginas, lido } = req.body;

    const livro = livros.find(l => l.id === livroId);

    if (!livro) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }

    if (titulo !== undefined) livro.titulo = titulo;
    if (autor !== undefined) livro.autor = autor;
    if (ano !== undefined) livro.ano = ano;
    if (paginas !== undefined) livro.paginas = paginas;
    if (lido !== undefined) livro.lido = lido;

    res.json(livro);
});

// 10. DELETE remover um livro pelo ID
app.delete('/livros/:id', (req, res) => {
    const livroId = parseInt(req.params.id);
    const index = livros.findIndex(l => l.id === livroId);

    if (index === -1) {
        return res.status(404).json({ error: 'Livro não encontrado' });
    }

    const livroRemovido = livros.splice(index, 1)[0];
    res.json({ mensagem: 'Livro removido com sucesso', livro: livroRemovido });
});

// Rota inicial para teste
app.get('/', (req, res) => {
    res.send(`
        <h1>📚 API de Livros</h1>
        <p>Endpoints disponíveis:</p>
        <ul>
            <li>GET <a href="/livros">/livros</a> - Listar todos</li>
            <li>GET <a href="/livros/quantidade">/livros/quantidade</a> - Quantidade</li>
            <li>GET <a href="/livros/estatisticas">/livros/estatisticas</a> - Estatísticas</li>
            <li>GET <a href="/livros/filtro?autor=Tolkien">/livros/filtro?autor=Tolkien</a> - Filtrar</li>
        </ul>
    `);
});

app.listen(port, () => {
    console.log(`Servidor rodando: http://localhost:${port}`);
});