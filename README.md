# Quite Live

A project that tries to solve the Deep Fake crises. We are living in a time, where
videos don't necessarily tell the truth anymore. This is a result of cheap, fast hardware
that can generate extremely realistic videos using machine learning techniques, such as a
[GAN network](https://en.wikipedia.org/wiki/Generative_adversarial_network). One such
technique is [Deep Fakes](https://en.wikipedia.org/wiki/Deepfake).

## Deepfakes, from wikipedia

> Deepfakes (a portmanteau of "deep learning" and "fake"[1]) are media that take
> a person in an existing image or video and replace them with someone else's
> likeness using artificial neural networks.[2] They often combine and superimpose
> existing media onto source media using machine learning techniques known as
> autoencoders and generative adversarial networks (GANs).[3][4] Deepfakes have
> garnered widespread attention for their uses in celebrity pornographic videos,
> revenge porn, fake news, hoaxes, and financial fraud.[5][6][7][8] This has elicited
> responses from both industry and government to detect and limit their use.[9][10]
>
> [Wikipedia link](https://en.wikipedia.org/wiki/Deepfake)

## How QuiteLive Prevents Deepfakes

One thing that any deepfakes needs is time to generate. _Note that there are new verisons that
exist that are more instant, and more research needs to be done on this on my part_
Ignoring them, if we can prove to someone that a video was recorded at a time, or simply prove
that the video was recorded live, we have proved that the video is indeed not deepfaked.

##### How we do it?

We use blockchain the main tool for proving time. A relevant quote from Wikipedia:

> A blockchain,[1][2][3] originally block chain,[4][5] is a growing list of records,
> called blocks, that are linked using cryptography.[1][6] Each block contains a
> cryptographic hash of the previous block,[6] **a timestamp**, and transaction data
> (generally represented as a Merkle tree).
>
> [Wikipedia link](https://en.wikipedia.org/wiki/Blockchain)

The important thing here is the timestamp. So we follow these steps:

1. Send a transaction at the beginning of the video
2. When the user is done with the video, hash each frame
3. Create a [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree) with each hash
   of each frame, and the [txid](https://learnmeabitcoin.com/guide/txid) of the
   transactions sent in the beginning of the video
4. Lastly, have the user recite the Merkle Root. In QuiteLive, we use a
   [Bip39](https://en.bitcoin.it/wiki/Seed_phrase) or seed phrase style to make it
   faster for the user to read.

And for someone to prove the video was recorded in live time, all they have to do
is find the transaction, hash each frame of the video, and see if the Merkle root
matches what the user said.

# So what is QuiteLive

QuiteLive is a web service which follows these steps. All one has to do is click record,
the server does all the work on its **Non Blocking** backend. And when the user is done with
the video, the server calculates the Merkle Root and prompts the user to resite it.

**It's all written in [NodeJs](https://nodejs.org/)**

### Install

`npm install` or `npm install --developement` if you are developing

### Run jsDocs

You must install the dev packages with `npm install --developement`

Then run `npm run docs`

If you want to check jsdoc syntax, run `npm run testDocs`

# Licence

This project is licenced under **GNU AGPLv3**. In the hopes it makes the
world a safer place.
