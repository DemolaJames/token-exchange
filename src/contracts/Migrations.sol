// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Migrations {
  address public owner = msg.sender;
  uint public last_completed_migration;

// tst1
  // modifier restricted() {
  //   require( msg.sender == owner,  "This function is restricted to the contract's owner" );
  //   _;
  // }

    modifier restricted() {
    if (msg.sender == owner) _;
  }


  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

// tst2
  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
