import { tokens, EVM_Revert } from './helpers'

const Token = artifacts.require('./Token')

require('chai') // chai is a js assertion library used for testing
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, receiver, exchange]) => {
    const name = 'Grim Token'
    const symbol = 'Grim'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    let token

    beforeEach(async () => {
        token = await Token.new()  //fetch token from block chain - nb Token.new() deploys a new version of the contract to the blockchain evertime its run
       
    })
        describe ('deployment', () => {
            it('tracks the name', async () => {
                const result = await token.name()
                result.should.equal(name)  //check the token 
            })
    
            it('tracks the symbol', async () => {
                const result = await token.symbol()
                result.should.equal(symbol) //check the token 
            })
    
            it('tracks the decimal', async () => {
                const result = await token.decimals()
                result.toString().should.equal(decimals)    //check the token 
            })
    
            it('tracks the total supply', async () => {
                const result = await token.totalSupply()
                result.toString().should.equal(totalSupply.toString())  //check the token 
            })
    
            it('assigns the total supply to the deployer', async () => {
                const result = await token.balanceOf(deployer)
                result.toString().should.equal(totalSupply.toString())  //check the token 
            })
        })
    
        describe ('sending tokens', () => {
            let result
            let amount
            
            describe('success', () => {

                beforeEach(async () => {
                    amount = tokens(100)
                    result =  await token.transfer(receiver, amount, { from: deployer})  // Transfer
                })
                
                it('transfers token balances', async () => {
                    let balanceOf
        
                    // After Transfer
                    balanceOf = await token.balanceOf(deployer)
                    balanceOf.toString().should.equal(tokens(999900).toString())
                    balanceOf = await token.balanceOf(receiver)
                    balanceOf.toString().should.equal(tokens(100).toString())
        
                })
        
                it('emits a transfer event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Transfer')
                    const event = log.args
                    event.from.toString().should.equal(deployer, 'from is correct')
                    event.to.should.equal(receiver, 'to is correct')
                    event.value.toString().should.equal(amount.toString(), 'value is correct')
                })

            })

            describe('failure', () => {
                
                it('rejects insufficient balances', async () => {
                   let invalidAmount 
                   
                    invalidAmount = tokens(100000000) // 100 million - greater than supply
                    await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_Revert);
        
                    // Attempt transfer tokens, whe you have none
                    invalidAmount = tokens(10) // recipient has no tokens 
                    await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_Revert);
        
        
                 })

                it('rejects invalid recipients ', async () => {
                    await token.transfer(0x0, amount, { from: deployer}).should.be.rejected;
                })
            })
    
        })

        describe ('approving tokens', () => {
            
            let result 
            let amount

            beforeEach(async () => {
                amount = tokens(100)
                result =  await token.approve(exchange, amount, { from: deployer})
            })

            describe ('success', () => {
                it('allocates an allowance for delegated token spending on exchange', async () => {
                    const allowance = await token.allowance(deployer, exchange)
                    allowance.toString().should.equal(amount.toString())

                })

                it('emits an Approval event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Approval')
                    const event = log.args
                    event.owner.toString().should.equal(deployer, 'owner is correct')
                    event.spender.should.equal(exchange, 'spender is correct')
                    event.value.toString().should.equal(amount.toString(), 'value is correct')
                })
            })

            describe ('failure', () => {
                it('rejects invalid spenders', async () => {
                    await token.approve(0x0, amount, {from: deployer}).should.be.rejected
                })

            })

        })

        describe ('delegated token transfers', () => {
            let result
            let amount

            beforeEach(async () => {
                amount = tokens(100)
                await token.approve(exchange, amount, {from: deployer}) // Transfer
            })
            
            describe('success', async () => {

                beforeEach(async () => {
                    result =  await token.transferFrom(deployer, receiver, amount, { from: exchange})  // Transfer
                })
                
                it('transfers token balances', async () => {
                    let balanceOf
        
                    // After Transfer
                    balanceOf = await token.balanceOf(deployer)
                    balanceOf.toString().should.equal(tokens(999900).toString())
                    balanceOf = await token.balanceOf(receiver)
                    balanceOf.toString().should.equal(tokens(100).toString())
        
                })

                it('resets the allowance', async () => {
                    const allowance = await token.allowance(deployer, exchange)
                    allowance.toString().should.equal('0')

                })
        
                it('emits a transfer event', async () => {
                    const log = result.logs[0];
                    log.event.should.eq('Transfer')
                    const event = log.args
                    event.from.toString().should.equal(deployer, 'from is correct')
                    event.to.should.equal(receiver, 'to is correct')
                    event.value.toString().should.equal(amount.toString(), 'value is correct')
                })

            })

            describe('failure', async () => {
                
                it('rejects insufficient amounts', async () => {
                   let invalidAmount 
                   
                    // Attempts to transfer to many tokens
                    invalidAmount = tokens(100000000) // 100 million - greater than supply
                    await token.transferFrom(deployer, receiver, invalidAmount, {from: exchange}).should.be.rejectedWith(EVM_Revert);
            
                 })

                it('rejects invalid recipients ', async () => {
                    await token.transferFrom(0x0, amount, { from: exchange}).should.be.rejected;
                })
            })
    
        })


})