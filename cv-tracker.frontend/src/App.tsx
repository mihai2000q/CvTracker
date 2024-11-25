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
import { Provider } from '@/components/ui/provider'
import Home from './views/Home'

function App() {
  return (
    <div className='app'>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route element={<Main />}>
              <Route element={<RedirectHome />}>
                <Route path={'login'} element={<Login />} />
                <Route path={'register'} element={<Register />} />
              </Route>

              <Route element={<RedirectAuthentication />}>
                <Route path={''} element={<Home />} />
                <Route path={'jobs'} element={<Jobs />} />
                <Route path={'companies'} element={<Companies />} />
                <Route path={'countries'} element={<Countries />} />

                <Route path={'404'} element={<NotFound />} />
                <Route path={'*'} element={<Navigate to={'404'} replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  )
}

export default App
