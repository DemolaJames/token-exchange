// Deposit and withdraw funds 
// Manage orders - Make and Cancel 
// Handle Trades - Change fees

// TODO:
// [ ] Set the fee account
// [ ] Deposit Ether
// [ ] Withdraw Ether
// [ ] Deposit tokens
// [ ] Withdraw tokens
// [ ] Check balances
// [ ] Make order 
// [ ] Cancel order
// [ ] Fill order
// [ ] Charge Fees

pragma solidity ^0.5.16;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";



contract Exchange {

     using SafeMath for uint; 

    // Variables
    address public feeAccount; // the account that recieves exchange 
    uint256 public feePercent;
    address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    // first key is the token address, second key is the address of the user, last key is the value held by user
    mapping(address => mapping(address => uint256)) public tokens;

    // order variables
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    // Events 
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order (
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint timestamp
    );
    event Cancel (
        uint256 id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade (
        uint256 id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );



    struct _Order {
        uint256 id; 
        address user;
        address tokenGet;
        uint amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Fallback : reverts if ether is sent directly to the smart contract by mistake  
    function() external {
        revert();
    }

     function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
         emit Deposit(ETHER, msg.sender,msg.value, tokens[ETHER][msg.sender]);

    }

    function withdrawEther(uint _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
         tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
         msg.sender.transfer(_amount);
          emit Withdraw(ETHER, msg.sender,_amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        // Which token - passed from arguement
        // How much - passed from arguement
        // 3: Manage deposit - update balance
        // Send tokens to contract
        // Emit necessary events

        require(_token != ETHER);        
        require(Token(_token).transferFrom(msg.sender, address(this), _amount)); // 3
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender,_amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
          require(_token != ETHER);     
         require(tokens[_token][msg.sender] >= _amount);
          tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
          require(Token(_token).transfer(msg.sender,_amount)); 
           emit Withdraw(_token, msg.sender,_amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256){
        return tokens[_token][_user];
    }


    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public{
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive,now);
    }


    function cancelOrder (uint _id) public {
        // fetch from bc 
        _Order storage _order = orders[_id];
        
        // verify creator
        require(address(_order.user) == msg.sender);

        // verify existence
        require(_order.id == _id);

        orderCancelled[_id] = true;
         emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive,now);
    }

    function fillOrder(uint _id) public {

        require(_id > 0 && _id <= orderCount);
        require(!orderFilled[_id]);
        require(!orderCancelled[_id]);
        // -1 fetch the order 
        _Order storage _order = orders[_id]; 
       
       _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);
        orderFilled[_order.id] = true;

    }


    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {

        // Fee paid by the user that fills the order, a.k.a msg sender
        // fee deducted from _amountGet
        uint _feeAmount = _amountGive.mul(feePercent).div(100);
        
        // perfom trade
        //_user is the perfomr that created the order
        tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender].sub(_amountGet.add(_feeAmount));
        tokens[_tokenGet][_user] = tokens[_tokenGet][_user].add(_amountGet);
         tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount].add(_feeAmount);
        tokens[_tokenGive][_user] = tokens[_tokenGive][_user].sub(_amountGive);
        tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender].add(_amountGet);

        // charge fees 
        // emit trade event
        emit Trade(_orderId, _user, _tokenGet, _amountGet, _tokenGive, _amountGive, msg.sender, now);

    }       
    

   


}