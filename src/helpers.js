export const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'
export const RED = 'danger'
export const GREEN = 'success'


export const DECIMALS = (10**18)
// Shortcut to avoid passing arround web3 connection
export const ether = (wei) => {
    if(wei) {
        return (wei / DECIMALS) // 18 decimal places
    }
}



// export const ether = (n) => {
//     return new web3.utils.BN(
//         web3.utils.toWei(n.toString(), 'ether')
//     )
// }

export const tokens = ether

export const formatBalance = (balance) => {
    
    balance = ether(balance)
    balance = Math.round(balance * 100) / 100
    return balance
}