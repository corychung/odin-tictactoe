const gameBoard = (function() {
    let board = [
        ["","",""],
        ["","",""],
        ["","",""]
    ];
    const currentBoard = () => board;
    const cell = (x,y) => board[x][y]; 
    function clear() {
        board = [["","",""],["","",""],["","",""]];
    }
    function add(x,y) {
        board[x][y] = gameController.getActivePlayer().symbol;
    }
    return {cell,currentBoard,add,clear}
})();

const gameController = (function() {
    function Player(name, symbol, score) {
        this.name = name;
        this.symbol = symbol;
        this.score = score;
    }
    let playerOne = new Player("player 1","X",0);
    let playerTwo = new Player("player 2","O",0);
    let activePlayer = playerOne;

    const getActivePlayer = () => activePlayer;
    function _nextTurn() {activePlayer = (activePlayer === playerOne) ? playerTwo : playerOne; }
    function _checkForWin() {
        board = gameBoard.currentBoard();
        for (let i = 0; i < 3; i++) {
            if (board[i][0] == board[i][1] && board[i][1] == board[i][2] && (board[i][2]!="")) return [[i,0],[i,1],[i,2]];
            if (board[0][i] == board[1][i] && board[1][i] == board[2][i] && (board[2][i]!="")) return [[0,i],[1,i],[2,i]];
        }
        if (board[0][0] == board[1][1] && board[1][1] == board[2][2]&&(board[1][1]!="")) return [[0,0],[1,1],[2,2]];
        if (board[0][2] == board[1][1] && board[1][1] == board[2][0]&&(board[1][1]!="")) return [[0,2],[1,1],[2,0]];
        return false;
    }
    function _checkForTie() {
        let flatBoard = board.flat();
        for (item of flatBoard) {
            if (item == "") return false;
        }
        return true;
    }
    function playRound(x,y) {
        if (gameBoard.cell(x,y) != "") return;
        else gameBoard.add(x,y);
        console.log(gameBoard.currentBoard());
        if (_checkForWin()) {
            displayController.win(_checkForWin());
            activePlayer.score++;
        }
        if (_checkForTie()) {
            displayController.tie();
        }
        else _nextTurn();
    }
    function getScore() {
        return [playerOne.score, playerTwo.score];
    }
    return {getActivePlayer, playRound, getScore}
})();

const displayController = (function() {
    let board,status,cells;
    let gameStatus = "";
    function init() {
        cacheDom();
        bindEvents();
        render();
    }
    function cacheDom() {
        board = document.querySelector(".game-board");
        status = document.querySelector(".status");
        cells = document.querySelectorAll('.game-cell');
        scoreOne = document.querySelector(".score-one")
        scoreTwo = document.querySelector(".score-two")

    }
    function bindEvents() {
        board.addEventListener("click", move)
    }
    function move(e) {
        if (e.target.classList.contains("game-cell")) {
            gameController.playRound(e.target.getAttribute("data-x"),e.target.getAttribute("data-y"));
            render();
        }
    }
    function render() {
        let counter = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells.item(counter).innerHTML = gameBoard.cell(i,j);
                counter++;
            }
        }
        scoreOne.textContent = `Player 1 Score: ${gameController.getScore()[0]}`;
        scoreTwo.textContent = `Player 2 Score: ${gameController.getScore()[1]}`;
        status.textContent = (gameStatus) || `It is P${gameController.getActivePlayer().name.substring(1)}'s turn to move.`;
    }
    function win(highlight) {
        board.removeEventListener("click", move);
        let counter = 0;
        for (let cell of highlight) {
            counter = 0;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (cell[0] == i && cell[1] == j)
                        cells.item(counter).classList.add("win");
                    counter++;
                }
            }
        }
        gameStatus = `P${gameController.getActivePlayer().name.substring(1)} wins! Click anywhere on the board to restart.`;
        board.addEventListener("click", restart)
    }
    function tie() {
        board.removeEventListener("click", move);
        gameStatus = `Tie! Click anywhere on the board to restart.`;
        board.addEventListener("click", restart)
    }
    function restart() {
        bindEvents();
        gameBoard.clear();
        gameStatus = "";
        cells.forEach((cell) => {cell.classList.remove("win")});
        render();
        board.removeEventListener("click", restart)
    }
    return {init,win,tie}
})();

displayController.init();
