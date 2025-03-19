
"use client";
import './index.css';
import { useState } from 'react';
import Player from '@/components/sample/tic-tac-toe/player';
import GameBoard from '@/components/sample/tic-tac-toe/game-board';
import GameLog from '@/components/sample/tic-tac-toe/game-log';
import GameOver from '@/components/sample/tic-tac-toe/game-over';
import { WINNING_COMBINATIONS } from '@/constants/sample/tic-tac-toe/winning-combinations'

const initialGameBoard: PlayerSymbol[][] = [
  [null, null, null],
  [null, null, null],
  [null, null, null]
]

export type PlayerSymbol = 'X' | 'O' | null;
export interface Turn {
  square: { row: number; cell: number };
  player: PlayerSymbol;
}
interface PlayerName {
  'X': string;
  'O': string;
}

// 현재 플레이어
const deriveActivePlayer = (gameTurn: Turn[]): PlayerSymbol => {
  let currentPlayer: PlayerSymbol = 'X';
  if (gameTurn.length > 0 && gameTurn[0].player === 'X') {
    currentPlayer = 'O';
  }

  return currentPlayer;
}

// 승자 결정
const deriveWinner = (board: PlayerSymbol[][], playerName: PlayerName) => {
  let winner = '';
  for (const combination of WINNING_COMBINATIONS) {
    const firstSquareSymbol = board[combination[0].row][combination[0].cell];
    const secondSquareSymbol = board[combination[1].row][combination[1].cell];
    const thirdSquareSymbol = board[combination[2].row][combination[2].cell];
    if (firstSquareSymbol && firstSquareSymbol === secondSquareSymbol && secondSquareSymbol === thirdSquareSymbol) {
      winner = playerName[firstSquareSymbol];
    }
  }
  return winner;
}

// 게임보드 상태 업데이트
const deriveBoard = (gameTurn: Turn[]) => {
  //const board = initialGameBoard; // 얖은복사. 리매치시에 이전값이 남아있음
  const board = [...initialGameBoard.map(arr => [...arr])]; // 깊은복사. 리매치에서 board를 초기화시키기 위함. 얖은복사를 하면 참조값이 같아져서 리매치시에 이전값이 남아있음

  for (const turn of gameTurn) {
    const { row, cell } = turn.square;
    board[row][cell] = turn.player;

  }
  return board;
}

const TicTacToePage = () => {
  // state상태가 변경되면 TicTacToePage가 리렌더링됨. 
  const [gameTurn, setGameTurn] = useState<Turn[]>([]);
  const [playerName, setPlayerName] = useState<PlayerName>({
    'X': 'Player1',
    'O': 'Player2'
  });
  const activePlayer = deriveActivePlayer(gameTurn);
  const board = deriveBoard(gameTurn);
  const winner = deriveWinner(board, playerName);
  const hasDraw = gameTurn.length === 9 && !winner;

  // 게임보드 선택
  const handleSelectSquare = (rowIndex: number, cellIndex: number) => {
    setGameTurn((prevGameTurn) => {
      const currentPlayer = deriveActivePlayer(prevGameTurn);

      const updatedTurns: Turn[] = [
        { square: { row: rowIndex, cell: cellIndex }, player: currentPlayer },
        ...prevGameTurn
      ];
      return updatedTurns;
    });
  }

  // 게임 재시작
  const handleRematchGame = () => {
    setGameTurn([]);
  }

  // Player 컴포넌트에서 이름을 변경하면 상태를 업데이트
  const handlePlayerName = (symbol: string, playerName: string) => {
    setPlayerName((prevPayerName) => {
      return {
        ...prevPayerName,
        [symbol]: playerName
      }
    })
  }

  return (
    <main>
      <div id='game-container'>
        <ol id='players' className='highlight-player'>
          <Player name='Player1' symbol='X' isActive={activePlayer === 'X'} onChangeName={handlePlayerName} />
          <Player name='Player1' symbol='O' isActive={activePlayer === 'O'} onChangeName={handlePlayerName} />
        </ol>
        {(winner || hasDraw) && <GameOver winner={winner} onRematch={handleRematchGame} />}
        <GameBoard onSelectSquare={handleSelectSquare} board={board} />
      </div>
      <GameLog gameTurn={gameTurn} />
    </main>
  )
}

export default TicTacToePage