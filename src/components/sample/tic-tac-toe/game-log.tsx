import { Turn } from '@/app/tic-tac-toe/page'

type Props = { gameTurn: Turn[] }

const GameLog = (props: Props) => {

  const gameTurnLog = props.gameTurn.map((turn, index) => {
    return (
      <li key={index}>
        player{turn.player} : {turn.square.row}, {turn.square.cell}
      </li>
    )
  })

  return (
    <div>{gameTurnLog}</div>
  )
}

export default GameLog;