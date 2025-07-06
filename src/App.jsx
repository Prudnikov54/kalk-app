import { Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ManagePage from './ManagePage'
import MaterialCalculator from './MaterialCalculator'

function App() {
  return (
    <div>
      <nav style={{ marginBottom: 20 }}>
        <Link to="/">Расчёт материала</Link> |{' '}
        <Link to="/manage">Добавить/удалить модели и цвета</Link>
      </nav>
      <Routes>
        <Route path="/" element={<MaterialCalculator />} />
        <Route path="/manage" element={<ManagePage />} />
      </Routes>
    </div>
  )
}

export default App
