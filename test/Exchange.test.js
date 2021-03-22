import { before } from 'lodash'
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from './helpers'

const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

require('chai') // chai is a js assertion library used for testing
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
    let token
    let exchange
    const feePercent = 10

    beforeEach(async () => {
        // deploy token
        token = await Token.new()

        // transfer to user1
        token.transfer(user1, tokens(100), {from: deployer})
        
        // deploy exchange
        exchange = await Exchange.new(feeAccount,feePercent)  //fetch token from block chain - nb Token.new() deploys a new version of the contract to the blockchain evertime its run
      
    })

        describe ('deployment', () => {
            it('tracks the fee account', async () => {
                const result = await exchange.feeAccount()
                result.should.equal(feeAccount)  //check the token 
            })

            it('tracks the fee percent', async () => {
                const result = await exchange.feePercent()
                result.toString().should.equal(feePercent.toString())  //check the token 
            })
        })

        describe ('fallback', () => {
            it('reverts when Ether is sent', async () => {
                await exchange.sendTransaction({ value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT)
            })
        })

        describe (' depositing ether', async () => {
            let result
            let amount

            beforeEach( async () => {

                amount = ether(1)
                result = await exchange.depositEther({from: user1, value: amount})
            })

            it('tracks the Ether deposit ', async () => {
                const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Deposit')
                const event = log.args
                event.token.toString().should.equal(ETHER_ADDRESS, 'token address is correct')
                event.user.toString().should.equal(user1, 'user address is correct')
                event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                event.balance.toString().should.equal(amount.toString(), 'balance is correct')
            })
        })

        describe ('withdrawing ether', async () => {
            let result
            let amount

            beforeEach( async () => {
                // deposit ether first
                amount = ether(1)
                result = await exchange.depositEther({from: user1, value: amount})
            })

            describe ('success', async () => {

                beforeEach(  async () => { 
                        // Withdraw ether 
                    result =  await exchange.withdrawEther(amount, {from: user1})

                    })
                

                    it('withdraws Ether funds ', async () => {
                        const balance = await exchange.tokens(ETHER_ADDRESS, user1)
                        balance.toString().should.equal('0')
                    })

                    it('emits a Withdraw event', async () => {
                        const log = result.logs[0];
                        log.event.should.eq('Withdraw')
                        const event = log.args
                        event.token.toString().should.equal(ETHER_ADDRESS, 'token address is correct')
                        event.user.toString().should.equal(user1, 'user address is correct')
                        event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                        event.balance.toString().should.equal('0', 'balance is correct')
                    })
            })

            describe ('failure', async () => {
                it('rejects withdraws for insufficient funds', async () => {
                    await exchange.withdrawEther(ether(100), {from: user1}).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })

        describe('depositing tokens', () => {

            let result
            let amount 
           

            describe('success', () => {

                beforeEach( async () => {
                    amount = tokens(10)
                    await token.approve(exchange.address, amount, {from: user1})
                    result = await exchange.depositToken(token.address, tokens(10), {from: user1})
    
    
                })

                it('tracks the token deposit', async () => {
                    // check exchange token balance
                    let balance 
                    balance =  await token.balanceOf(exchange.address)
                    balance.toString().should.equal(amount.toString())
                    // Check tokens on exchange
                    balance = await exchange.tokens(token.address, user1)
                    balance.toString().should.equal(amount.toString())

                })

                it('emits a Deposit event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Deposit')
                    const event = log.args
                    event.token.toString().should.equal(token.address, 'token address is correct')
                    event.user.toString().should.equal(user1, 'user address is correct')
                    event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                    event.balance.toString().should.equal(amount.toString(), 'balance is correct')
                })

            })

            describe('failure', () => {

                it('rejects ether deposit', async () => {
                    await exchange.depositToken(ETHER_ADDRESS,tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT);
                })

                it('fails when no tokens are approved', async () => {
                    // dont approve any token before depositing
                    await exchange.depositToken(token.address, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT);
                })
                
            })
        })

        describe ('withdrawing tokens', async () => {
            let result
            let amount

            describe ('success', async () => {

                beforeEach(  async () => { 
                        // Deposit tokens first 
                    amount = tokens(10)
                    await token.approve(exchange.address, amount, {from: user1})
                    await exchange.depositToken(token.address, amount, {from: user1})
                   
                    // withdraw tokens
                    result =  await exchange.withdrawToken(token.address, amount, {from: user1})

                    })
                

                    it('withdraws token funds ', async () => {
                        const balance = await exchange.tokens(token.address, user1)
                        balance.toString().should.equal('0')
                    })

                    it('emits a Withdraw event', async () => {
                        const log = result.logs[0];
                        log.event.should.eq('Withdraw')
                        const event = log.args
                        event.token.toString().should.equal(token.address, 'token address is correct')
                        event.user.toString().should.equal(user1, 'user address is correct')
                        event.amount.toString().should.equal(amount.toString(), 'amount is correct')
                        event.balance.toString().should.equal('0', 'balance is correct')
                    })
            })

            describe ('failure', async () => {

                it('rejects Ether withdraw', async () => {
                    await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
                })

                it('fails for insufficient balances', async () => {
                    await exchange.withdrawToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })

        describe ('checking balance', async () => {
            beforeEach( async () => {
                exchange.depositEther({from: user1, value: ether(1)})
            })

            it('should return the balance', async () => {
                const balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                await balance.toString().should.equal(ether(1).toString())
            })
        })

        describe ('making orders', async () => {
            let result;
            beforeEach(async () => {
                result = await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1} )
            })

            it('tracks newly created orders', async() => {
                const orderCount = await exchange.orderCount()
                orderCount.toString().should.equal('1')

                const order = await exchange.orders('1')

                order.id.toString().should.equal('1');
                order.user.should.equal(user1, 'user is correct')
                order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
            })

            it('emits a Order event', async () => {
                const log = result.logs[0];
                log.event.should.eq('Order')
                const event = log.args
                event.id.toString().should.equal(('1'), 'token address is correct')
                event.user.toString().should.equal(user1, 'user address is correct')
                event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
                event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
            })



            
        })

        describe ('order actions', async () => {
        
            beforeEach(async () => {
                // user1 deposits ether
                await exchange.depositEther({from: user1, value: ether(1)} )
                // user1 makes an order to buy tokens with Ether
                await token.transfer(user2, tokens(100), {from: deployer})
                // user2 deposits tokens only 
                await token.approve(exchange.address, tokens(2), {from: user2})
                await exchange.depositToken(token.address, tokens(2), {from: user2})
                // user1 makes an order to buy tokens with ether
                await exchange.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {from: user1})
            })

            describe ('filling orders', async () => {
                let result
  
                describe('success', async () => {
                    beforeEach(async () => {
                        result = await exchange.fillOrder('1', {from: user2})
                    })



                    it('excutes the trade & charges fees', async () => {
                        let balance
                        
                        balance = await exchange.balanceOf(token.address, user1)
                        balance.toString().should.equal(tokens(1).toString(), 'user1 received tokens')
                        balance = await exchange.balanceOf(ETHER_ADDRESS, user2)
                        balance.toString().should.equal(ether(1).toString(), 'user2 received Ether')
                        balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
                        balance.toString().should.equal('0', 'user1 Ether deducted')
                        balance = await exchange.balanceOf(token.address, user2)
                        balance.toString().should.equal(tokens(0.9).toString(), 'user2 tokens deducted wit fee applied')
                        const feeAccount = await exchange.feeAccount()
                        balance = await exchange.balanceOf(token.address, feeAccount)
                        balance.toString().should.equal(tokens(0.1).toString(), 'feeAccount received fee')
                    })

                    it('updates filled orders', async () => {
                        const orderFilled = await exchange.orderFilled(1)
                        orderFilled.should.equal(true)
                    })
  
                  
  
                    it('emits a Trade event', async () => {
                      const log = result.logs[0];
                      log.event.should.eq('Trade')
                      const event = log.args
                      event.id.toString().should.equal(('1'), 'id is correct')
                      event.user.toString().should.equal(user1, 'user address is correct')
                      event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
                      event.userFill.should.equal(user2)
                      event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                  })
                })
  
                describe('failure', async () => {
    
                    it('rejects invalid order ids', async () => {
                        const invalidOrderId = 9999
                        await exchange.fillOrder(invalidOrderId, {from: user2}).should.be.rejectedWith(EVM_REVERT)
                    })

                    it('rejects already-filled orders', async () => {
                        // fill the order
                        await exchange.fillOrder('1', {from: user2}).should.be.fulfilled

                        // try to fill it again
                        await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                    })
                    
                    it('rejects cancelled orders', async () => {
                        //cancel the order 
                        await exchange.cancelOrder('1', {from: user1}).should.be.fulfilled
                        // try to fill the order
                        await exchange.fillOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                        
                    })
                })
            })

          describe ('cancelling orders', async () => {
              let result

              describe('success', async () => {
                  beforeEach(async () => {
                      result = await exchange.cancelOrder('1', {from: user1})
                  })

                  it('updates cancelled orders', async () => {
                      const orderCancelled = await exchange.orderCancelled(1)
                      orderCancelled.should.equal(true)
                  })

                  it('emits a Cancel event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Cancel')
                    const event = log.args
                    event.id.toString().should.equal(('1'), 'id is correct')
                    event.user.toString().should.equal(user1, 'user address is correct')
                    event.tokenGet.toString().should.equal(token.address, 'tokenGet is correct')
                    event.amountGive.toString().should.equal(ether(1).toString(), 'amountGive is correct')
                })
              })

            describe('failure', async () => {

                it('rejects invalid order ids', async () => {
                    const invalidOrderId = 9999
                    await exchange.cancelOrder(invalidOrderId, {from: user1}).should.be.rejectedWith(EVM_REVERT)
                })
              
                it('rejects unauthorized cancelations', async () => {
                    await exchange.cancelOrder('1', {from: user2}).should.be.rejectedWith(EVM_REVERT)
                   
                })
            })
          })


            
        })


    


})