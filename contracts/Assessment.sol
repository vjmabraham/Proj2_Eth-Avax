// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public randomNumber;
    string[] private adjectives = ["Mysterious", "Ancient", "Forgotten", "Hidden", "Lost"];
    string[] private nouns = ["City", "Temple", "Tomb", "Ruins"];
    mapping (address => uint256) public depositCount;
    mapping (address => uint256) public withdrawalCount;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event RandomNumberGenerated(uint256 randomNumber);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);

        depositCount[msg.sender]++;
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);

        withdrawalCount[msg.sender]++;
    }

    function generateRandomNumber() public {
        // Generate a random number using the block timestamp and the sender's address
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100;
        randomNumber = rand;
        emit RandomNumberGenerated(rand);
    }

    function generateTreasureName() public view returns (string memory) {
        uint256 adjectiveIndex = uint256(keccak256(abi.encodePacked(block.timestamp))) % adjectives.length;
        uint256 nounIndex = uint256(keccak256(abi.encodePacked(block.timestamp + 1))) % nouns.length;
        return string(abi.encodePacked(adjectives[adjectiveIndex], " ", nouns[nounIndex]));
    }

    function getTransactionCount() public view returns (uint256, uint256) {
        return (depositCount[msg.sender], withdrawalCount[msg.sender]);
    }

    function getUserLevel() public view returns (string memory) {
        if (depositCount[msg.sender] < 2) {
            return "Newbie";
        } else if (depositCount[msg.sender] < 4) {
            return "Adventurer";
        } else {
            return "Veteran";
        }
    }

}
