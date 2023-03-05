import React, {FC} from 'react';
import './Button.scss'
import {CellState, CellValue} from "../../types";

interface ButtonProps {
  row: number
  col: number
  state: CellState
  value: CellValue
  onClick(rowParam: number, colParam: number): (...args: any[]) => void
  onContext(rowParam: number, colParam: number): (...args: any[]) => void
  red?: boolean
}
const Button: FC<ButtonProps> = ({row, col, state, value, onClick, onContext, red}) => {
  const renderContent = (): React.ReactNode => {
    if (state === CellState.visible) {

      if (value === CellValue.bomb) {
        return (
            <span className="bomb" role="img" aria-label="bomb">
              💣
            </span>
        )
      } else if (value === CellValue.none) {
        return null
      }

      return value


    } else if (state === CellState.flagged) {
      return (
          <span role="img" aria-label="flag">
              🚩
            </span>
      )
    } else if (state === CellState.question) {
      return (
          <span role="img" aria-label="question">
              ❓
            </span>
      )
    }






    return null
  }
  return (
      <div className={`Button ${state === CellState.visible ? 'visible' : ''} value-${value} ${red ? 'red' : ''}`} onClick={onClick(row, col)} onContextMenu={onContext(row, col)}>
        {renderContent()}
      </div>
  );
};

export default Button;
