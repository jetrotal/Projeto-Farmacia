// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './meu.css'
import meunome from './assets/forme.tsx'

function App() {
//  const [count, setCount] = useState(0)

  return (
    <>
      <div className="container">
        <h1>{meunome()}</h1>
        <img src={reactLogo} className="logo" alt="React logo" />
      </div>
    </>
  )
}

export default App
