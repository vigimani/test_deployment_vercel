import {
  Tr,
  Td,
  Flex,
  Table,
  Th,
  Thead,
  Tbody,
  useToast,
} from "@chakra-ui/react";
import { useAccount, useProvider, useBalance } from "wagmi";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Eventslist() {
  const contractAddress = "0xf389A9478da87Dd46C5ED9AD4D481b9A45Bc488a";
  //WAGMI
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const [transactions, setTransactions] = useState([]);
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

  //CHAKRA-UI
  const toast = useToast()


  useEffect(() => {
    updatetransactions();
  }, []);

  useEffect(() => {
    const contract = new ethers.Contract(contractAddress, abi, provider)
    contract.on("etherDeposited", (account, amount) => {
        toast({
            title: 'Deposit Event',
            description: "Account : " + account + " - amount " + amount,
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    })
    return () => {
        contract.removeAllListeners();
        };
    }, [])

    // provider.send('eth_getBlockByHash', [ blockHash, true ]).then((block) => {
    //     console.log(block);
    // });

  const updatetransactions = async () => {
    const contract = await new ethers.Contract(
      contractAddress,
      abi,
      provider
    );
    const filter = {
      address: contractAddress,
    };
    let events = await contract.queryFilter(filter, 8361848);
    console.log(events)
    let allTheEvents = [];
    for await (const event of events) {
      const txnReceipt = await event.getTransactionReceipt();
      let eventLog = txnReceipt.logs[0]; // could be any index
      let log = contract.interface.parseLog(eventLog); // Use the contracts interface
      allTheEvents.push(log);
    }
    console.log(allTheEvents);
    setTransactions(allTheEvents);
    let eventsfiltered = events.filter((e) => e.event == "etherDeposited");
  };

  const timestampconvert = (date) => {
    let milliseconds = 1000*date
    let dateObject = new Date(milliseconds)
    return dateObject.toLocaleString()
  }

  return (
    <Flex direction="column" mt="1rem">
      <Table>
        <Thead>
        <Tr>
            <Th>Time</Th>
            <Th>Name</Th>
            <Th>Account</Th>
            <Th>Amount</Th>
        </Tr>
        </Thead>
        <Tbody>
        {transactions.map((event, index) => {
          return (
            <Tr key={index}>
            <Td>{timestampconvert((event.args.when).toString())}</Td>
            {event.eventFragment.name == "etherDeposited" ? (
                <>
                <Td color="green">{event.eventFragment.name}</Td>
                <Td color="green">{event.args.account}</Td>
                <Td color="green" >{ethers.utils.formatEther(event.args.amount)} ETH</Td>
                </>
                ):(        
                    <>        
                    <Td color="red">{event.eventFragment.name}</Td>
                    <Td color="red">{event.args.account}</Td>
                    <Td color="red">-{ethers.utils.formatEther(event.args.amount)} ETH</Td>
                    </>
                )}
            </Tr>
          );
        })}
        </Tbody>
      </Table>
    </Flex>
  );
}
