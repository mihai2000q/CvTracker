import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import Main from './views/Main'
import Login from './views/Login'
import Register from './views/Register'
import Jobs from './views/Jobs'
import Companies from './views/Companies'
import Countries from './views/Countries'
import NotFound from './views/NotFound'
import RedirectAuthentication from './router/RedirectAuthentication'
import RedirectHome from './router/RedirectHome'

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route element={<Main />}>
            <Route path={'/'} element={<Navigate to={'jobs'} replace />} />

            <Route element={<RedirectHome />}>
              <Route path={'login'} element={<Login />} />
              <Route path={'register'} element={<Register />} />
            </Route>

            <Route element={<RedirectAuthentication />}>
              <Route path={'jobs'} element={<Jobs />} />
              <Route path={'companies'} element={<Companies />} />
              <Route path={'countries'} element={<Countries />} />

              <Route path={'404'} element={<NotFound />} />
              <Route path={'*'} element={<Navigate to={'404'} replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
