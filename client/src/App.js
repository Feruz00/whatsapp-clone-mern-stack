
import {BrowserRouter as Router, Switch , Route, Redirect} from 'react-router-dom';
import Confirm from './components/Confirm/confirm';
import Login from './components/Login/Login';
import Forgot from './components/Forgot/Forgot';
import Reset from './components/Reset/Reset';

import Register from './components/Register/Register';
import { AuthProvider, Auth } from './context';
import  SocketProvider  from './socket';
import ConversationProvider from './conversation'
import Navbar from './components/Navbar/Navbar'
import Direct from './components/Direct/Direct';
import Profile from './components/Profile/Profile';
import Home from './components/Home/Home';
import Explore from './components/Explore/Explore';
import UserSearch from './components/UserSearch/UserSearch';

function App() {
  return (
    <>
    <Router>
      <AuthProvider>
          <Switch>
            <FadingRoute exact path="/register" component={Register} access={false} />
            <FadingRoute exact path="/activate/:id/:token" component={Confirm} access={false} />
            <FadingRoute exact path="/confirm_password/:email/:token" component={Forgot} access={false} />
            <FadingRoute exact path="/reset" component={Reset} access={false}/> 
            <FadingRoute exact path="/login" component={Login} access={false}/>
            
            <SocketProvider>
              <ConversationProvider>
                <Navbar />
                <FadingRoute exact path="/"  component={Home} access={true}/>
                <FadingRoute exact path="/direct"  component={Direct} access={true}/>
                <FadingRoute exact path="/settings"  component={Profile} access={true}/>
                <FadingRoute exact path="/explore"  component={Explore} access={true}/>
                <FadingRoute exact path="/user/:username"  component={UserSearch} access={true}/>              
              </ConversationProvider>
              
            </SocketProvider>
            
          </Switch>
      </AuthProvider>
    </Router>
    </>
  );
}

function FadingRoute({ component: Component, access,  ...rest }) {
  const {user} = Auth();
  if( user && !access ) return <Redirect to="/" />
  if( !user && access) return  <Redirect to="/login" />
  return (
    <Route
      {...rest}
      render={ routeProps => ( <Component {...routeProps} />) }
    />
  );
}

export default App;
