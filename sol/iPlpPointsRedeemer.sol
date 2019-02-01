pragma solidity ^0.5.0;

// interface for redeeming PLP Points
contract iPlpPointsRedeemer {
  function reserveTokens() public view returns (uint remaining);
  function transferFromReserve(address _to, uint _value) public;
}
