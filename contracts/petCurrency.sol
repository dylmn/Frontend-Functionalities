// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract petCurrency {
    address payable public owner;
    uint256 public petBalance;
    uint petPrice = 1 ether;

    mapping(address => uint) private allBalances;
    mapping(address => bool) private ownsPet;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Transfer(address indexed to, uint256 amount);
    event PetBought(address indexed buyer);
    event PetSold(address indexed seller);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        petBalance = initBalance;
    }

    function getPetBalance() public view returns(uint256){
        return petBalance;
    }

    function lookUpBalance(address _account) public view returns(uint256) {
        return allBalances[_account]; // get petBalance for specific address
    }

    function ownedPet() public view returns(bool) {
        return ownsPet[msg.sender];
    }

    function petDeposit(uint256 _amount) public payable {
        uint _previousBalance = petBalance;

        require(msg.sender == owner, "You are not the owner of this account");
        petBalance += _amount;
        assert(petBalance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 petBalance, uint256 withdrawAmount);

    function petWithdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = petBalance;
        if (petBalance < _withdrawAmount) {
            revert InsufficientBalance({
                petBalance: petBalance,
                withdrawAmount: _withdrawAmount
            });
        }

        petBalance -= _withdrawAmount;
        assert(petBalance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function petTransfer(address _receiver, uint _number) public payable {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_receiver != address(0), "Invalid recipient address");
        require(petBalance >= _number, "Insufficient petBalance");

        petBalance -= _number;
        allBalances[_receiver] += _number;
        if (petBalance < _number) {
            revert("Reverting: You do not have enough funds for this transaction");
        }
        emit Transfer(_receiver, _number);
    }

    function buyPet() public {
        require(!ownsPet[msg.sender] , "You already own a pet.");

        if (petBalance < petPrice) {
            revert("Insufficient balance to buy the pet.");
        }

        petBalance -= petPrice;
        ownsPet[msg.sender] = true;
        
        emit PetBought(msg.sender);

        assert(ownsPet[msg.sender] == true);
    }

    function sellPet() public {
        require(ownsPet[msg.sender], "You do not own a pet to sell.");

        ownsPet[msg.sender] = false;
        petBalance += petPrice;

        emit PetSold(msg.sender);

        assert(ownsPet[msg.sender] == false);
    }
}
