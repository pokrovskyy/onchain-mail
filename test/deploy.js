const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;

describe("OnChainMail", function () {
  it("Generic test", async function () {
    const OnChainMail = await ethers.getContractFactory("OnChainMail");
    const mailer = await OnChainMail.deploy();
    await mailer.deployed();

    // get sample sender and receiver
    const [sender, recipient, other] = await ethers.getSigners();
    let tx;

    // sender sends email #1 to receiver (10 ETH reward)
    tx = await mailer
      .connect(sender)
      .sendEmail(recipient.address, true, "asdfasdfasdf", {
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

    // sender tries to retract after read
    await expect(mailer.connect(sender).retract(1)).to.be.revertedWith(
      "Cannot retract read email"
    );

    // recipient tries to transfer token to someone else
    await expect(mailer.connect(recipient).transferFrom(recipient.address, other.address, 1)).to.be.revertedWith(
      "Cannot perform this for encrypted email"
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
    expect(await provider.getBalance(mailer.address)).to.eq(ethers.utils.parseEther("100"));

    // sender retracts email #2
    tx = await mailer.connect(sender).retract(2);
    await tx.wait();

    expect((await mailer.receivedMailCount(recipient.address))).to.eq(0);
    expect((await mailer.sentMailCount(sender.address))).to.eq(0);
    expect(await provider.getBalance(sender.address)).to.within(
      ethers.utils.parseEther("9989"),
      ethers.utils.parseEther("9990")
    );

    expect(await provider.getBalance(mailer.address)).to.eq(0);

    // test adding/reading encryption key
    let pubKey = "this_is_my_public_key";
    tx = await mailer.connect(sender).addEncryptionPublicKey(pubKey);
    expect((await mailer.encryptionPublicKeys(sender.address))).to.eq(pubKey);

    // test clearing encryption key
    tx = await mailer.connect(sender).clearEncryptionPublicKey();
    expect((await mailer.encryptionPublicKeys(sender.address))).to.eq('');
  });
});
