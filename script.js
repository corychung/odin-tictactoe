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
        board[x][y] = player.getActivePlayer().symbol;
    }
    return {cell, currentBoard, add, clear}
})();

const player = (function() {
    function Player(name, symbol, score) {
        this.name = name;
        this.symbol = symbol;
        this.score = score;
    }

    let playerOne = new Player("Player 1","X",0);
    let playerTwo = new Player("Player 2","O",0);
    let activePlayer = playerOne;

    const getActivePlayer = () => activePlayer;
    function switchActivePlayer() {activePlayer = (activePlayer === playerOne) ? playerTwo : playerOne; }
    function getScores() {
        return [playerOne.score, playerTwo.score];
    }
    function getName(person) {
        return (person == "playerOne") ? playerOne.name : playerTwo.name;
    }
    function setName(player, newName) {
        if (player == "playerOne") {playerOne.name = newName;}
        if (player == "playerTwo") {playerTwo.name = newName;}
    }

    return {getActivePlayer, switchActivePlayer, getScores, getName, setName};
})();

const gameController = (function() {
    
    function makeMove(x,y) {
        if (gameBoard.cell(x,y) != "") return;
        else gameBoard.add(x,y);
        console.log(gameBoard.currentBoard());
        if (_checkForWin()) {
            displayController.displayWin(_checkForWin());
            player.getActivePlayer().score++;
        }
        if (_checkForTie()) {
            displayController.displayTie();
        }
        else player.switchActivePlayer();
    }

    // Returns coordinates to be highlighted by displayController on win
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
        for (item of board.flat()) {
            if (item == "") return false;
        }
        return true;
    }

    return {makeMove}
})();

const displayController = (function() {
    let board,status,cells;
    let gameEndMsg = "";
    
    function start() {
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
            gameController.makeMove(e.target.getAttribute("data-x"),e.target.getAttribute("data-y"));
            render();
        }
    }

    function render() {
        scoreOne.textContent = `${player.getName("playerOne")} (X): ${player.getScores()[0]}`;
        scoreTwo.textContent = `${player.getName("playerTwo")} (O): ${player.getScores()[1]}`;
        status.textContent = (gameEndMsg) || `It is ${player.getActivePlayer().name}'s turn to move.`;
        let counter = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells.item(counter).innerHTML = gameBoard.cell(i,j);
                counter++;
            }
        }
    }

    function displayWin(highlight) {
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
        gameEndMsg = `${player.getActivePlayer().name} wins! Click anywhere on the board to restart.`;
        board.addEventListener("click", resetBoard)
    }

    function displayTie() {
        board.removeEventListener("click", move);
        gameEndMsg = `Tie! Click anywhere on the board to restart.`;
        board.addEventListener("click", resetBoard)
    }

    function resetBoard() {
        bindEvents();
        gameBoard.clear();
        gameEndMsg = "";
        cells.forEach((cell) => {cell.classList.remove("win")});
        render();
        board.removeEventListener("click", resetBoard)
    }

    return {start, displayWin, displayTie, render}
})();

const changeName = function() {
    let editingPlayer;

    function start() {
        cacheDOM();
        bindEvents();
        render();
    }
    function bindEvents() {
        editNameButton.forEach((button) => {button.addEventListener("click", showDialog)});
        nameSubmit.addEventListener("click", changeName)
    }
    function cacheDOM() {
        nameDialog = document.querySelector(".edit-name-dialog");
        editNameButton = document.querySelectorAll(".edit-name");
        dialogTitle = document.querySelector(".edit-name-title");

        nameInput = document.querySelector("#name-input");
        nameSubmit = document.querySelector("#submit-button");
        nameForm = document.querySelector(".name-form");
    }
    function showDialog(event) {
        if (event.target.classList.contains("player-one")) {
            dialogTitle.textContent = `Change ${player.getName("playerOne")}'s name`;
            editingPlayer = "one";
        }
        if (event.target.classList.contains("player-two")) {
            dialogTitle.textContent = `Change ${player.getName("playerTwo")}'s name`;
            editingPlayer = "two";
        }

        nameDialog.showModal();
    }   
    function changeName(event) {
        event.preventDefault();
        if (!nameInput.value) return;
        else {
            if (editingPlayer == "one") {player.setName("playerOne",nameInput.value)}
            if (editingPlayer == "two") {player.setName("playerTwo",nameInput.value)}
        }
        nameDialog.close();
        nameForm.reset();
        displayController.render();
    }
    return {start}
}();

displayController.start();
changeName.start();
