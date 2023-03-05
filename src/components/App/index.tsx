import React, {FC, useEffect, useState} from 'react';
import NumberDisplay from "../NumberDisplay";
import {generateCells, openMultipleCells} from "../../utils";
import Button from "../Button";
import {Cell, CellState, CellValue, Face} from "../../types";
import './App.scss'
import {MAX_COLS, MAX_ROWS} from "../../constants";

const App: FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.smile);
  const [time, setTime] = useState<number>(0)
  const [live, setLive] = useState<boolean>(false)
  const [bombCounter, setBombCounter] = useState<number>(40)
  const [hasLost, setHasLost] = useState<boolean>(false)
  const [hasWon, setHasWon] = useState<boolean>(false)


  useEffect(() => {
    const hadleMouseDown = () => {
      setFace(Face.oh)
    }

    const handleMouseUp = (): void => {
      setFace(Face.smile)
    }

    window.addEventListener('mousedown', hadleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousedown', hadleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    if (live && time < 999) {
      const timer = setInterval(() => {
        setTime(time + 1)
      }, 1000)


      return () => {
        clearInterval(timer)
      }
    }
  }, [live, time, setTime])

  useEffect(() => {
    if (hasLost) {
      setLive(false)
      setFace(Face.lost)
    }
  }, [hasLost]);

  useEffect(() => {
    if (hasWon) {
      setLive(false)
      setFace(Face.won)
    }
  }, [hasWon]);
  


  const handleCellClick = (rowParam: number, colParam: number) => (): void => {

    let newCells = cells.slice()
    if (!live) {
      let isABomb = newCells[rowParam][colParam].value === CellValue.bomb
      while (isABomb) {
        newCells = generateCells()
        if (newCells[rowParam][colParam].value !== CellValue.bomb) {
          isABomb = false
          break
        }
      }
      setLive(true)
    }

    const currentCell = newCells[rowParam][colParam]


    if (currentCell.state === CellState.flagged || currentCell.state === CellState.visible || currentCell.state === CellState.question) {
      return
    }

    if (currentCell.value === CellValue.bomb) {
      setHasLost(true)
      newCells[rowParam][colParam].red = true
      newCells = showAllBombs()
      setCells(newCells)
      return;
    } else if (currentCell.value === CellValue.none) {
      newCells = openMultipleCells(newCells, rowParam, colParam)
      setCells(newCells)
    } else {
      newCells[rowParam][colParam].state = CellState.visible
    }

    let safeOpenCellsExists = false
    for (let row = 0; row < MAX_ROWS; row++){
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col]

        if (currentCell.value !== CellValue.bomb && currentCell.state === CellState.open) {
          safeOpenCellsExists = true
          break
        }
      }
    }

    if (!safeOpenCellsExists) {
      newCells = newCells.map(row => row.map(cell => {
        if (cell.value === CellValue.bomb) {
          return {
            ...cell,
            state: CellState.flagged
          }
        }
        return cell
      }))
      setHasWon(true)
    }

    setCells(newCells)
  }

  const handleCellContext = (rowParam: number, colParam: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    e.preventDefault()

    if (!live) {
      return;
    }

    const currentCells = cells.slice()
    const currentCell = cells[rowParam][colParam]

    if (currentCell.state === CellState.visible) {
      return
    } else if (currentCell.state === CellState.open) {
      currentCells[rowParam][colParam].state = CellState.flagged
      setCells(currentCells)
      setBombCounter(bombCounter - 1)
    } else if (currentCell.state === CellState.flagged) {
      currentCells[rowParam][colParam].state = CellState.question
      setCells(currentCells)
    } else if (currentCell.state === CellState.question) {
      currentCells[rowParam][colParam].state = CellState.open
      setCells(currentCells)
      setBombCounter(bombCounter + 1)
    }

  }

  const handleFaceClick = (): void => {
    setLive(false)
    setTime(0)
    setCells(generateCells())
    setBombCounter(40)
    setHasLost(false)
    setHasWon(false)
  }

  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
            <Button
                key={`${rowIndex}-${colIndex}`}
                state={cell.state}
                value={cell.value}
                row={rowIndex}
                col={colIndex}
                red={cell.red}
                onClick={handleCellClick}
                onContext={handleCellContext}
            />))
  }

  const showAllBombs = (): Cell[][] => {
    const currentCells = cells.slice()

    return currentCells.map((row) => row.map((cell) =>  {
      if (cell.value === CellValue.bomb) {
        return {
          ...cell,
          state: CellState.visible
        }
      }

      return cell
    }))
  }

  return (
      <div className="App">
        <div className="Header">
          <NumberDisplay value={bombCounter} />
          <div onClick={handleFaceClick} className="Face"><span role="img" aria-label="face">{face}</span></div>
          <NumberDisplay value={time} />
        </div>
        <div className="Body">{
          renderCells()
        }</div>
      </div>
  );
};

export default App;
