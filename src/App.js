import { useState } from "react";

function Square({value, onSquareClick, isWinningSquare}){
    return (
        <button className={`square ${isWinningSquare ? 'winning' : ''}`} onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay }){
    function handleClick(i){
        if (calculateWinner(squares).winner || squares[i]) {
            return;
        }

        const nextSquares = squares.slice();

        if (xIsNext) {
            nextSquares[i] = 'X';
        } else {
            nextSquares[i] = 'O';
        }

        // Calculate row and col based on index i
        const row = Math.floor(i / 3);
        const col = i % 3;

        onPlay(nextSquares, row, col);
    }

    const { winner, winningSquares } = calculateWinner(squares);
    let status;

    if (winner) {
        status = 'Winner: ' + winner;
    } else if (squares.every(Boolean)) {
        status = 'Draw!';
    } else {
        status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    }

    const rows = []; //Array to contain rows
    const size = 3;

    //Use two loops to make the squares
    for (let i = 0; i < size; i++) {
        const squaresInRow = []; //Array to contain squares in rows

        for(let j = 0; j < size; j++) {
            let index = i * 3 + j;

            squaresInRow.push(
                <Square 
                    key={index} 
                    value={squares[index]} 
                    onSquareClick={() => handleClick(index)} 
                    isWinningSquare={winningSquares && winningSquares.includes(index)} //highlight the three squares if winner
                />
            );
        }

        rows.push(<div className="board-row" key={i}>{ squaresInRow }</div>) //Add rows to 'rows' array
    }

    return (
        <>
            <div className="status">{status}</div>
            {rows}
        </>
    );
}

export default function Game() {
    const [xIsNext, setXIsNext] = useState(true);
    const [history, setHistory] = useState([{ squares: Array(9).fill(null), row: null, col: null }]);
    const [currentMove, setCurrentMove] = useState(0);
    const currentSquares = history[currentMove].squares;
    const [isAscending, setIsAscending] = useState(true); // Sort state
    
    function handlePlay(nextSquares, row, col) {
        const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, row, col }];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
        setXIsNext(!xIsNext);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
        setXIsNext(nextMove % 2 === 0);
    }

    const moves = history.map((squares, move) => {
        let description;

        if (move > 0) {
            //Show “You are at move #…”
            description = `You are at move # (${squares.row}, ${squares.col})`;
        } else {
            description = 'Go to game start';
        }

        //Use div instead of a button
        return (
            <li key={move}>
                <div onClick={() => jumpTo(move)}>{description}</div>
            </li>
        );
    });

    // Sort moves based on the isAscending state
    const sortedMoves = isAscending ? moves : [...moves].reverse();

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
            </div>

            <div className="game-info">
                <label htmlFor="sortOrder">Sort moves:</label>
                <select
                    id="sortOrder"
                    value={isAscending ? "ascending" : "descending"}
                    onChange={(e) => setIsAscending(e.target.value === "ascending")}
                >
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
                
                <ol>{sortedMoves}</ol>
            </div>
        </div>
    );
}

function calculateWinner (squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7], 
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];

        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], winningSquares: [a, b, c] };
        }
    }

    return { winner: null, winningSquares: null };
}