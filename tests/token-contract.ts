import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TokenContract } from "../target/types/token_contract";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
} from "@solana/spl-token"; 
import { assert } from "chai";
import {PublicKey} from '@solana/web3.js';

describe("token-contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  // Retrieve the TokenContract struct from our smart contract
  const program = anchor.workspace.TokenContract as Program<TokenContract>;
  // Generate a random keypair that will represent our token
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  // AssociatedTokenAccount for anchor's workspace wallet
  let associatedTokenAccount = new PublicKey("31pRxXSrdS64W4JUMY8MQF54G5R7rnKiwpEvZEHwQY7b");

  // it("Mint a token", async () => {
  //   // Get anchor's wallet's public key
  //   const key = anchor.AnchorProvider.env().wallet.publicKey;
  //   // Get the amount of SOL needed to pay rent for our Token Mint
  //   const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
  //     MINT_SIZE
  //   );

  //   // Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
  //   associatedTokenAccount = await getAssociatedTokenAddress(
  //     mintKey.publicKey,
  //     key
  //   );

  //   // Fires a list of instructions
  //   const mint_tx = new anchor.web3.Transaction().add(
  //     // Use anchor to create an account from the mint key that we created
  //     anchor.web3.SystemProgram.createAccount({
  //       fromPubkey: key,
  //       newAccountPubkey: mintKey.publicKey,
  //       space: MINT_SIZE,
  //       programId: TOKEN_PROGRAM_ID,
  //       lamports,
  //     }),
  //     // Fire a transaction to create our mint account that is controlled by our anchor wallet
  //     createInitializeMintInstruction(
  //       mintKey.publicKey, 0, key, key
  //     ),
  //     // Create the ATA account that is associated with our mint on our anchor wallet
  //     createAssociatedTokenAccountInstruction(
  //       key, associatedTokenAccount, key, mintKey.publicKey
  //     )
  //   );

  //   // sends and create the transaction
  //   const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, [mintKey]);

  //   console.log(
  //     await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
  //   );

  //   console.log("Account: ", res);
  //   console.log("Mint key: ", mintKey.publicKey.toString());
  //   console.log("User: ", key.toString());

  //   // Executes our code to mint our token into our specified ATA
  //   await program.methods.mintToken().accounts({
  //     mint: mintKey.publicKey,
  //     tokenProgram: TOKEN_PROGRAM_ID,
  //     tokenAccount: associatedTokenAccount,
  //     authority: key,
  //   }).rpc();

  //   // Get minted token amount on the ATA for our anchor wallet
  //   const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data["parsed"].info.tokenAmount.amount;
  //   assert.equal(minted, 10);
  // });

  it("Transfer token", async () => {
    // token address
    let mintAdress = new PublicKey("DxtQHCcnQVv3ZPUxYPLx2d12NeKHbhBztYzuNof9N4kH");

    //wallet sender publickey
    const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    //waller receiver publickey
    const toWallet = new PublicKey("EHNMjqeWGjPr837AHWkUGA2jTdXCHD7Q1MWyJTt9xcJW")
    //The ATA for a token on the to wallet (but might not exist yet)
    const toATA = await getAssociatedTokenAddress(
      mintAdress,
      toWallet
    );
    // const toATA = new PublicKey("Gpkj7myeEXgaT34QGMuA85xviNHSUQanzN7cFfNagnGh")
    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        myWallet, toATA, toWallet, mintAdress
      )
    );

    // Sends and create the transaction
    // await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, []);

    // Executes our transfer smart contract 
    await program.methods.transferToken().accounts({
      tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      // tokenProgram: TOKEN_PROGRAM_ID,
      from: associatedTokenAccount,
      fromAuthority: myWallet,
      to: toATA,
    }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data["parsed"].info.tokenAmount.amount;
    console.log(minted);
    assert.equal(minted, 5);
    // assert.equal(2, 5);
  });
});
