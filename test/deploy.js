const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OnChainMail", function () {
  it("Should return the new greeting once it's changed", async function () {
    const OnChainMail = await ethers.getContractFactory("OnChainMail");
    const greeter = await OnChainMail.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
