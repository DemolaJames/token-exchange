import React , { Component } from 'react';
import './App.css';
import { loadWeb3, loadAccount, loadToken, loadExchange } from '../store/interactions'
import { connect } from 'react-redux';
import Navbar from './Navbar'
import Content from './Content'
import { contractsLoadedSelector } from '../store/selectors'

class App extends Component {
  componentWillMount(){
    
    this.loadBlockChainData(this.props.dispatch)
  }

  async loadBlockChainData(dispatch) {

    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
   await loadAccount(web3, dispatch)

   const token = await loadToken(web3, networkId, dispatch) 
   if(!token){
    window.alert('Token smart contract not detected on the current network, Please select another network with meta mask');
   }
   const exchange =  loadExchange(web3,networkId, dispatch)

   if(!exchange){
    window.alert('Exchange smart contract not detected on the current network, Please select another network with meta mask');
   }
   
  //  const abi = Token.abi
  // const networks = Token.networks
  // const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address)
  // const totalSupply = await token.methods.totalSupply().call()
  //  console.log('abis',abi)
  //  console.log('network data',networks[networkId].address)
  //  console.log('toekn',token)
   // console.log('total supply',totalSupply)
  }

render() {
    return (
      <div>
        <Navbar></Navbar>
        { this.props.contractsLoaded ? <Content/> : <div className="content"></div> }
      
     </div>
    );
  }
}

// export default App;

function mapStateToProps(state){
  return {
     contractsLoaded: contractsLoadedSelector(state)
  }
}

export default connect(mapStateToProps)(App)