
type Props = { winner: string | null, onRematch: () => void }

const GameOver = (props: Props) => {
  return (
    <div id='game-over'><h2>GameOver </h2>
      {props.winner && <p>{props.winner} win</p>}
      {!props.winner && <p>it draw</p>}
      <p >
        <button onClick={props.onRematch}>rematch</button>
      </p>
    </div>
  )
}

export default GameOver;