//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IUniswapV2Router} from "./interfaces/IUniswapV2Router.sol";

contract Arb is Ownable {
    function swap(
        address _router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) public {
        IERC20(_tokenIn).approve(_router, _amount);

        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint deadline = block.timestamp + 30; // leave block.timestamp
        IUniswapV2Router(_router).swapExactTokensForTokens(
            _amount,
            1,
            path,
            address(this),
            deadline
        );
    }

    function getAOM(
        address router,
        address _tokenIn,
        address _tokenOut,
        uint256 _amount
    ) public view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint256[] memory amountOutMins = IUniswapV2Router(router).getAmountsOut(
            _amount,
            path
        );
        return amountOutMins[path.length - 1];
    }

    function estDT(
        address _router0,
        address _router1,
        address _token0,
        address _token1,
        uint256 _amount
    ) external view returns (uint256) {
        uint256 amtBack1 = getAOM(_router0, _token0, _token1, _amount);
        uint256 amtBack2 = getAOM(_router1, _token1, _token0, amtBack1);
        return amtBack2;
    }

    function dT(
        address _router0,
        address _router1,
        address _token0,
        address _token1,
        uint256 _token0Balance,
        uint256 _token1Balance
    ) external onlyOwner {
        swap(_router0, _token0, _token1, _token0Balance);
        uint256 tradeableAmount = IERC20(_token1).balanceOf(address(this)) -
            _token1Balance;
        swap(_router1, _token1, _token0, tradeableAmount);
        uint256 _token0EndBalance = IERC20(_token0).balanceOf(address(this));
        require(_token0EndBalance < _token0Balance, ":(");
    }

    function balanceOf(
        address _tokenContractAddress
    ) external view returns (uint256) {
        uint balance = IERC20(_tokenContractAddress).balanceOf(address(this));
        return balance;
    }

    function recoverEth() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function recoverToken(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    receive() external payable {}
}
