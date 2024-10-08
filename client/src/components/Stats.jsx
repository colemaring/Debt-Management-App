import React, { useEffect, useState } from "react";
import { OpenAI } from "openai";

const Stats = ({ token }) => {
  const [data, setData] = useState(null);
  const storedData = JSON.parse(localStorage.getItem("surveyData"));
  const totalDebt = storedData.current_debt;
  const [monthlyAvg, setMonthlyAvg] = useState(null);
  const [topCategory, setTopCategory] = useState(null);
  const [chatResponse, setChatResponse] = useState("");

  const getData = async () => {
    // Fetch transactions data
    const transactionsResponse = await fetch(
      `https://freedomfinances.xyz/api/transactions`,
      {
        method: "GET",
      }
    );

    const transactionsData = await transactionsResponse.json();
    if (transactionsData.error != null) {
      console.log(transactionsData.error);
      return;
    }

    setData(transactionsData);

    // Fetch liabilities data
    const liabilitiesResponse = await fetch(
      `https://freedomfinances.xyz/api/liabilities`,
      {
        method: "GET",
      }
    );

    const liabilitiesData = await liabilitiesResponse.json();
    if (liabilitiesData.error != null) {
      console.log(liabilitiesData.error);
      return;
    }

    // Combine transactions and liabilities data
    // const combinedData = {
    //   ...transactionsData,
    //   liabilities: liabilitiesData,
    // };
  };

  useEffect(() => {
    getData();
  }, []);

  //   const chatWithGPT3 = async (transactionData) => {
  //     try {
  //       const response = await openai.chat.completions.create({
  //         model: "gpt-3.5-turbo",
  //         messages: [
  //           {
  //             role: "system",
  //             content: "You are a helpful assistant.",
  //           },
  //           {
  //             role: "user",
  //             content: `Given the transactions data, calculate the average monthly spending. Only respond with the number, nothing else.
  //   ${JSON.stringify(transactionData)}`,
  //           },
  //         ],
  //       });
  //       let string = response.choices[0].message.content;
  //       setMonthlyAvg(string);

  //       console.log(response + "stats"); // Log the entire response for debugging
  //     } catch (error) {
  //       console.error("Error calling OpenAI API:", error);
  //     }
  //   };

  const chatWithGPT32 = async (transactionData) => {
    try {
      const response = await fetch(`https://freedomfinances.xyz/api/chat3`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionData }),
      });

      const response1 = await response.json();
      let string = response1.choices[0].message.content;
      setTopCategory(string);

      console.log(response + "stats"); // Log the entire response for debugging
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
    }
  };

  function calculateRecentMonthlySpending(transactionData) {
    const transactions = transactionData.latest_transactions;

    // Find the most recent month
    const recentMonth = Math.max(
      ...transactions.map((transaction) => {
        return new Date(transaction.authorized_date).getMonth();
      })
    );

    // Filter transactions for the most recent month
    const recentTransactions = transactions.filter((transaction) => {
      const transactionMonth = new Date(transaction.authorized_date).getMonth();
      return transactionMonth === recentMonth;
    });

    // Calculate total spending for the most recent month
    const totalSpending = recentTransactions.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    // Update the monthlyAvg state
    setMonthlyAvg(`${totalSpending.toFixed(2)}`);
  }

  // Example usage

  useEffect(() => {
    if (data) {
      //   chatWithGPT3(data);
      chatWithGPT32(data);
      calculateRecentMonthlySpending(data);
    }
  }, [data]);

  return (
    <div
      style={{
        color: "white",
        padding: "0.5rem",
        borderRadius: "4px",
        height: "100%",
        margin: "1rem",
        marginTop: "0",
        fontWeight: "700px", // me
        display: "flex",
        textAlign: "center",
        justifyContent: "space-between", // Optional: Adjusts spacing between items
        marginRight: "10vw",
        marginLeft: "10vw",
      }}
    >
      <div>
        <h4 style={{ fontWeight: "400" }}>This Month's Spending</h4>
        <p style={{ fontWeight: "700", fontSize: 30 }}>${monthlyAvg}</p>
      </div>

      <div>
        <h4 style={{ fontWeight: "400" }}>Loan Amount</h4>
        <p style={{ fontWeight: "700", fontSize: 30 }}>
          ${Number(totalDebt).toLocaleString()}
        </p>
      </div>

      <div>
        <h4 style={{ fontWeight: "400" }}>Top Spending Category</h4>
        <p style={{ fontWeight: "700", fontSize: 30 }}>{topCategory}</p>
      </div>
    </div>
  );
};

export default Stats;
