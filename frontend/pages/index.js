import Head from 'next/head'
import { Header } from '@/components/Header'
// import Contract from "./../artifacts/contracts/Bank.sol/Bank"
import { useAccount, useProvider, useSigner } from 'wagmi'
import { List, Heading, Spinner, Center, Flex, Box, Text, Input, Button, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Eventslist from '@/components/Eventslist';

export default function Home() {


  let abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "when",
          "type": "uint256"
        }
      ],
      "name": "etherDeposited",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "account",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "when",
          "type": "uint256"
        }
      ],
      "name": "etherWithdrawed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalanceAndLastDeposit",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "balance",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastDeposit",
              "type": "uint256"
            }
          ],
          "internalType": "struct Bank.Account",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBalanceOfUser",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  const contractAddress = "0xf389A9478da87Dd46C5ED9AD4D481b9A45Bc488a"
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()
  const toast = useToast()
  

  const [depositAmount, setDepositAmount] = useState()
  const [withdrawAmount, setWithdrawAmount] = useState()
  const [amountInVault, setAmountInVault] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // const contractRead = useContractRead({
  //   address: contractAddress,
  //   abi: Contract.abi,
  //   functionName: 'getBalanceOfUser',
  // })

  useEffect(() => {
    if(isConnected) {
      updateBalance()
    }
  }, [address, isConnected])
  
  useEffect(() => {
    console.log("provider changed")
  }, [provider])
  
  useEffect(() => {
    console.log("adress changed")
  }, [address])
  
  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected })
    },
  })

  const updateBalance = async() => {
      // let zz = await contractRead
      // console.log((zz.data).toString())
      const contract = await new ethers.Contract(contractAddress, abi, provider)
      console.log(provider)
      console.log(contract)
      let a = await contract.connect(address).getBalanceOfUser()
      let balance = parseFloat(parseFloat(a.toString())/Math.pow(10,18)).toFixed()
      setAmountInVault(balance)
  }

  const deposit = async() => {
    setIsLoading(true)
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let depositAmountETH = ethers.utils.parseEther(depositAmount)
      let transaction = await contract.deposit({value : depositAmountETH})
      await transaction.wait(1)
      await updateBalance()

      toast({
        title: 'Congratulations!',
        description: "Your have sent "+ String(depositAmount) +" ethers to the vault",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "An error occured, please try again...",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    setIsLoading(false)
  }


  const withdraw = async() => {
    setIsLoading(true)
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer)
      let withdrawAmountETH = ethers.utils.parseEther(withdrawAmount)
      let transaction = await contract.withdraw(withdrawAmountETH)
      await transaction.wait(1)
      await updateBalance()
      toast({
        title: 'Congratulations!',
        description: "Your have withdraw "+String(withdrawAmount) +" ethers from the vault",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
    catch {
      toast({
        title: 'Error',
        description: "An error occured, please try again...",
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
    setIsLoading(false)
  }


  return (
    <>
        <Head>
          <title>Create Next App</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header />
        {isConnected ? (
          <>
            <Center>
              <Box>
                <Text mt="2rem" fontSize='6xl'>Bank DAPP</Text>
                {!isLoading ? (
                  <>
                  <Text fontSize='2xl'>You have {amountInVault} Eth on the smart contract</Text>
                  <Text mt="3rem"fontSize='4xl'>Deposit</Text>
                    <Flex>
                      <Input placeholder='Amount in ETH' width="auto" onChange={(e) => setDepositAmount(e.target.value)}/>
                      <Button onClick={()=> deposit()} colorScheme='green'>Deposit</Button>
                    </Flex>
                    <Text mt="3rem" fontSize='4xl'>Withdraw</Text>
                    <Flex>
                    <Input placeholder='Amount in ETH' width="auto" onChange={(e) => setWithdrawAmount(e.target.value)}/>
                    <Button colorScheme='blue' onClick={()=> withdraw()}>Withdraw</Button>
                    </Flex>
                    <Heading mt="3rem" fontSize='4xl'>Events</Heading>
                    <List>
                      <Eventslist/>
                    </List>
                    </>
                  ) : (
                    <>
                    <Spinner
                      thickness='4px'
                      speed='0.65s'
                      emptyColor='gray.200'
                      color='blue.500'
                      size='xl'
                    />
                      <Text mt="3rem"fontSize='4xl'>Transaction in progress, see metamask</Text>
                    </>
                  )
                  }
              </Box>
            </Center>
            </>
        ) : (
          <Text>Merci de vous connecter !!! :(</Text>
        )}
    </>
  )
}
