
import { useState } from 'react'
type Props = { name: string, symbol: string, isActive: boolean, onChangeName: (symbol: string, playerName: string) => void }

const Player = (props: Props) => {
  const [playerName, setPlayerName] = useState(props.name);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    // 직접 값 설정: 상태 업데이트가 비동기적으로 이루어질 때, 특히 상태가 여러 번 업데이트될 때 문제가 발생할 수 있음. 리엑트에서 스케줄되어 업데이트함
    // 예를들어서 setIsEditing(!isEditing); setIsEditing(!isEditing); 이렇게 두번 실행했을떄, 두번째 실행에서 첫번째 실행의 값을 기반으로 업데이트를 하기 때문에 값이 1번만 바뀜
    // setIsEditing(!isEditing);

    // 함수형 업데이트: 비동기적으로 이루어질 때 더 안전(즉시실행). 여러 번 상태 업데이트가 발생하더라도 항상 최신 상태 값을 기반으로 새로운 상태 값을 계산
    setIsEditing(editing => !editing);
    props.onChangeName(props.symbol, playerName);
  }

  const handleChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  }

  let playerElement = <span className='player-name'>{playerName}</span>;

  if (isEditing) {
    playerElement = <input type='text' required value={playerName} onChange={handleChangePlayerName} />;
  }

  return (
    <li className={props.isActive ? 'active' : undefined}>
      <span className='player'>
        {playerElement}
        <span className='player-symbol'>{props.symbol}</span>
      </span>
      <button onClick={handleEditClick}>{isEditing ? 'save' : 'edit'}</button>

    </li>
  )
}

export default Player