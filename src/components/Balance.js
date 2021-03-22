import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loadBalances, depositEther, withdrawEther, depositToken ,withdrawToken } from '../store/interactions'
import Spinner from './Spinner'
import { Tabs, Tab } from 'react-bootstrap'
import {
    web3Selector,
    exchangeSelector,
    tokenSelector,
    accountSelector,
    etherBalanceSelector,
    tokenBalanceSelector,
    exchangeEtherBalanceSelector,
    exchangeTokenBalanceSelector,
    balancesLoadingSelector,
    etherDepositAmountSelector,
    etherWithdrawAmountSelector,
    tokenDepositAmountSelector,
    tokenWithdrawAmountSelector
    
} from '../store/selectors'
import { etherDepositAmountChanged, etherWithdrawAmountChanged, tokenDepositAmountChanged, tokenWithdrawAmountChanged } from '../store/action'

const showForm = (props) => {
  const { etherBalance,
     tokenBalance, 
     exchangeEtherBalance, 
     exchangeTokenBalance, 
     dispatch, 
     etherDepositAmount,
     exchange,
    token,
    account,
    web3,
    etherWithdrawAmount,
    tokenWithdrawAmount,
    tokenDepositAmount } = props
  return(
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
        <Tab eventKey="deposit" title="Deposit" className="bg-dark">
            <table className="table table-dark table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ETH</td>
                    <td>{etherBalance}</td>
                    <td>{exchangeEtherBalance}</td>
                  </tr>

                </tbody>
              
            </table>

            <form className="" onSubmit={(event) => {
                  event.preventDefault()
                  depositEther(dispatch, exchange, web3, etherDepositAmount, account)
                }}>
                  <div className="row">

                
                <div className="col-md-7">
                  <input type="text" placeholder="ETH Amount" onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))} className="form-control form-control-sm bg-dark text-white" required />
                </div>
                  <div className="col-md-5">
                    <button type="submit" className="btn cadet btn-block btn-sm">Deposit</button>
                  </div>
                  </div>
            </form>

            <br/>

            <table className="table table-dark table-sm small">
              
                <tbody>
                  <tr>
                    <td>GRIM</td>
                    <td>{tokenBalance}</td>
                    <td>{exchangeTokenBalance}</td>
                  </tr>

                </tbody>
              
            </table> 

            <form className="" onSubmit={(event) => {
                  event.preventDefault()
                  depositToken(dispatch, exchange, web3, token, tokenDepositAmount, account)
                }}>
              <div className="row">
                <div className="col-md-7">
                  <input type="text" placeholder="GRIM Amount" onChange={(e) => dispatch(tokenDepositAmountChanged(e.target.value))} className="form-control form-control-sm bg-dark text-white" required />
                  </div>
                  <div className="col-md-5">
                    <button type="submit" className="btn cadet btn-block btn-sm">Deposit</button>
                  </div>
                </div>
            </form>

        </Tab>

        <Tab eventKey="withdraw" title="Withdraw" className="bg-dark"> 
        <table className="table table-dark table-sm small">
                <thead>
                    <tr>
                        <th>Token</th>
                        <th>Wallet</th>
                        <th>Exchange</th>
                    </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ETH</td>
                    <td>{etherBalance}</td>
                    <td>{exchangeEtherBalance}</td>
                  </tr>

                </tbody>
              
            </table>

        <form className="" onSubmit={(event) => {
            event.preventDefault()
            withdrawEther(dispatch, exchange, web3, etherWithdrawAmount, account)
          }}>
            <div className="row">

           
          <div className="col-md-7">
            <input type="text" placeholder="ETH Amount" onChange={(e) => dispatch(etherWithdrawAmountChanged(e.target.value))} className="form-control form-control-sm bg-dark text-white" required />
           </div>
            <div className="col-md-5">
              <button type="submit" className="btn btn-danger btn-block btn-sm">Withdraw</button>
            </div>
            </div>
        </form>

        <br/>

        <table className="table table-dark table-sm small">
              
                <tbody>
                  <tr>
                    <td>GRIM</td>
                    <td>{tokenBalance}</td>
                    <td>{exchangeTokenBalance}</td>
                  </tr>

                </tbody>
              
            </table> 

        <form className="" onSubmit={(event) => {
            event.preventDefault()
            withdrawToken(dispatch, exchange, web3, token, tokenWithdrawAmount, account)
          }}>
            <div className="row">

           
          <div className="col-md-7">
            <input type="text" placeholder="GRIM Amount" onChange={(e) => dispatch(tokenWithdrawAmountChanged(e.target.value))} className="form-control form-control-sm bg-dark text-white" required />
           </div>
            <div className="col-md-5">
              <button type="submit" className="btn btn-danger btn-block btn-sm">Withdraw</button>
            </div>
            </div>
        </form>


    </Tab>
  </Tabs>


  )
}


class Balance extends Component {
    componentWillMount(){
    
        this.loadBlockChainData()
      }
    
      async loadBlockChainData() {
        const {dispatch, web3, exchange, token, account } = this.props
        await loadBalances(dispatch, web3, exchange, token, account)
      }

    render() {
        //console.log(this.props.showOrderBook, this.props.orderBook)
        return (

            <div className="card bg-dark text-white">
            <div className="card-header">
              Balance
            </div>
            <div className="card-body">
             {this.props.showForm ? showForm(this.props) : <Spinner />}
            </div>
          </div>

        )
    }
}

function mapStateToProps(state){

  // console.log({
  //   account: accountSelector(state),
  //   exchange: exchangeSelector(state),
  //   token: tokenSelector(state),
  //   web3: web3Selector(state),

  //   etherBalance: etherBalanceSelector(state),
  //   tokenBalance: tokenBalanceSelector(state),
  //   exchangeEtherBalance: exchangeEtherBalanceSelector(state),
  //   exchangeTokenBalance: exchangeTokenBalanceSelector(state),
  //   balancesLoading: balancesLoadingSelector(state)
  // })
    const balancesLoading = balancesLoadingSelector(state)
    return{
         account: accountSelector(state),
         exchange: exchangeSelector(state),
         token: tokenSelector(state),
         web3: web3Selector(state),

         etherBalance: etherBalanceSelector(state),
         tokenBalance: tokenBalanceSelector(state),
         exchangeEtherBalance: exchangeEtherBalanceSelector(state),
         exchangeTokenBalance: exchangeTokenBalanceSelector(state),
         balancesLoading,
         showForm: !balancesLoading,
         etherDepositAmount: etherDepositAmountSelector(state),
         etherWithdrawAmount: etherWithdrawAmountSelector(state),
         tokenDepositAmount: tokenDepositAmountSelector(state),
         tokenWithdrawAmount: tokenWithdrawAmountSelector(state)

    }
}

export default connect(mapStateToProps)(Balance)
