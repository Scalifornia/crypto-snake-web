# Crypto Snake

Jogo arcade para navegador, em português, sem instalação nem dependências de produção.

- **Clássico:** recolher moedas e evitar o próprio corpo.
- **Contra o tempo:** cada moeda acrescenta segundos; atravessar bordas e corpo é permitido.
- **Sobrevivência:** a velocidade aumenta a cada moeda.

O menu permite escolher o modo e a dificuldade, consultar o progresso e alterar som, imagem e controlos. Moedas e valores são pontuação fictícia. O progresso e os rankings são guardados apenas neste navegador; quando o armazenamento não está disponível, o jogo continua com dados temporários.

## Executar localmente

Na pasta deste projeto:

```sh
python3 -m http.server 5174 --bind 127.0.0.1
```

Abrir <http://127.0.0.1:5174/>. Não é necessário compilar. Para alojamento estático, servir `index.html`, `app.js`, `menu.js`, `style.css` e `assets/`.

## Controlos

| Ação | Computador | Telemóvel |
| --- | --- | --- |
| Direção | Setas / W A S D | Deslizar no tabuleiro / botões de direção |
| Pausa e continuar | Espaço / P / Esc / botão | Botão Pausa / Continuar |
| Recomeçar | R / botão na pausa | Botão na pausa |
| Guia para a moeda | H / botão Guia | Definições |

A partida pausa ao sair da janela. Ao rodar o telemóvel, mantém o tabuleiro lógico e ajusta a sua escala.

## Verificação

Com Node.js 18 ou posterior:

```sh
node --test tests/game.test.cjs
```

Os testes executam a lógica real com relógio e navegador simulados: pausa, temporizadores, controlos, colisões, rotação, reinício, armazenamento e rankings. O aspeto visual e os eventos reais de navegador exigem também verificação no computador e no telemóvel.

## Organização

Os ficheiros da raiz pertencem ao Crypto Snake. `servigo-app/`, `kliko/` e os arquivos de outros projetos são independentes e não são necessários para executar o jogo.
