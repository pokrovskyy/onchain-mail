const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;

describe("OnChainMail", function () {
  it("Generic test", async function () {
    const OnChainMail = await ethers.getContractFactory("OnChainMail");
    const mailer = await OnChainMail.deploy();
    await mailer.deployed();

    // get sample sender and receiver
    const [sender, recipient] = await ethers.getSigners();
    let tx;

    // sender sends email #1 to receiver (10 ETH reward)
    tx = await mailer
      .connect(sender)
      .sendEmail(recipient.address, false, "asdfasdfasdf", {
        value: ethers.utils.parseEther("10"),
      });
    await tx.wait();

    // reader reads email #1
    tx = await mailer.connect(recipient).markRead(1);
    await tx.wait();

    expect(await provider.getBalance(recipient.address)).to.within(
      ethers.utils.parseEther("10009"),
      ethers.utils.parseEther("10010")
    );

    // recipient purges email #1 from inbox
    tx = await mailer.connect(recipient).purge(1);
    await tx.wait();

    expect((await mailer.receivedMailCount(recipient.address))).to.eq(0);
    expect((await mailer.sentMailCount(sender.address))).to.eq(1);

    // sender purges email #1 from sent mail
    tx = await mailer.connect(sender).purge(1);
    await tx.wait();

    expect((await mailer.receivedMailCount(sender.address))).to.eq(0);

    // sender sends another email #2 (100 ETH reward)
    tx = await mailer
      .connect(sender)
      .sendEmail(recipient.address, false, "asdfasdfasdf", {
        value: ethers.utils.parseEther("100"),
      });
    await tx.wait();

    expect((await mailer.receivedMailCount(recipient.address))).to.eq(1);
    expect((await mailer.sentMailCount(sender.address))).to.eq(1);
    expect(await provider.getBalance(sender.address)).to.within(
      ethers.utils.parseEther("9889"),
      ethers.utils.parseEther("9890")
    );

    // sender retracts email #2
    tx = await mailer.connect(sender).retract(2);
    await tx.wait();

    expect((await mailer.receivedMailCount(recipient.address))).to.eq(0);
    expect((await mailer.sentMailCount(sender.address))).to.eq(0);
    expect(await provider.getBalance(sender.address)).to.within(
      ethers.utils.parseEther("9989"),
      ethers.utils.parseEther("9990")
    );
  });
});
