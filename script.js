let monthlyTransactions = [
    []
];

let currentMonth = 0;

const maximumMonths = 12;


// HTML ELEMENTS

const canvas =
    document.getElementById("graph");

const ctx =
    canvas.getContext("2d");

const startingMoneyInput =
    document.getElementById("startingMoney");

const daysInput =
    document.getElementById("amountOfDays");

const addDayButton =
    document.getElementById("addDay");

const removeDayButton =
    document.getElementById("removeDay");

const dayCards =
    document.getElementById("dayCards");

const amountCounter =
    document.getElementById("amountCounter");

const previousMonthButton =
    document.getElementById("previousMonth");

const nextMonthButton =
    document.getElementById("nextMonth");

const monthCount =
    document.getElementById("monthCount");

const graphScroll =
    document.getElementById("graphScroll");

const saveButton =
    document.getElementById("saveButton");

const printReport =
    document.getElementById("printReport");


// GRAPH SETTINGS

const leftSpace = 85;
const rightSpace = 25;
const topSpace = 30;
const bottomSpace = 50;

const screenGraphColor = "#FFD700";
const printGraphColor = "#000000";

let graphColor =
    screenGraphColor;


// GENERAL FUNCTIONS

function getNumberOfDays() {

    return Math.max(
        7,
        Math.min(
            31,
            Number(daysInput.value) || 31
        )
    );
}


function getStartingBalanceInCents() {

    return Math.round(
        (Number(startingMoneyInput.value) || 0) * 100
    );
}


function getCurrentTransactions() {

    return monthlyTransactions[currentMonth];

}


function formatMoney(cents) {

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD"
        }
    ).format(cents / 100);
}


function protectText(text) {

    const temporaryElement =
        document.createElement("div");

    temporaryElement.textContent =
        text;

    return temporaryElement.innerHTML;
}


// MONTH BALANCE CALCULATION

function calculateMonthBalances(monthIndex) {

    const days =
        getNumberOfDays();

    let balance =
        getStartingBalanceInCents();


    // Calculate all previous months first.

    for (
        let earlierMonth = 0;
        earlierMonth < monthIndex;
        earlierMonth++
    ) {

        const earlierTransactions =
            monthlyTransactions[earlierMonth] || [];


        for (
            let day = 1;
            day <= days;
            day++
        ) {

            const todaysTransactions =
                earlierTransactions.filter(
                    function(transaction) {

                        return (
                            transaction.day === day
                        );

                    }
                );


            for (
                const transaction
                of todaysTransactions
            ) {

                balance +=
                    transaction.amount;

            }
        }
    }


    const openingBalance =
        balance;

    const balances = [];

    const selectedTransactions =
        monthlyTransactions[monthIndex] || [];


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const todaysTransactions =
            selectedTransactions.filter(
                function(transaction) {

                    return (
                        transaction.day === day
                    );

                }
            );


        for (
            const transaction
            of todaysTransactions
        ) {

            balance +=
                transaction.amount;

        }


        balances.push(balance);
    }


    return {

        openingBalance:
            openingBalance,

        closingBalance:
            balance,

        balances:
            balances

    };
}


// CREATE DAY CARDS

function renderDays() {

    const numberOfDays =
        getNumberOfDays();

    dayCards.innerHTML = "";


    for (
        let day = 1;
        day <= numberOfDays;
        day++
    ) {

        const card =
            document.createElement("section");

        card.className =
            "dayCard";

        card.dataset.day =
            day;


        card.innerHTML = `
            <h3>Day ${day}</h3>

            <form
                class="dayForm"
                data-day="${day}"
            >

                <label>
                    Description

                    <input
                        class="itemDescription"
                        type="text"
                        maxlength="50"
                        placeholder="Paycheck, rent..."
                        required
                    >
                </label>


                <label>
                    Amount

                    <input
                        class="itemAmount"
                        type="number"
                        step="0.01"
                        placeholder="1500 or -900"
                        required
                    >
                </label>


                <button
                    class="dayAddButton"
                    type="submit"
                >
                    Add
                </button>

            </form>


            <div
                class="dayItems"
                data-items-for-day="${day}"
            ></div>
        `;


        dayCards.appendChild(card);
    }


    renderTransactions();
}


// DISPLAY TRANSACTIONS

function renderTransactions() {

    const numberOfDays =
        getNumberOfDays();

    const currentTransactions =
        getCurrentTransactions();


    for (
        let day = 1;
        day <= numberOfDays;
        day++
    ) {

        const itemContainer =
            document.querySelector(
                `[data-items-for-day="${day}"]`
            );


        if (!itemContainer) {

            continue;

        }


        const dayTransactions =
            currentTransactions.filter(
                function(transaction) {

                    return (
                        transaction.day === day
                    );

                }
            );


        if (dayTransactions.length === 0) {

            itemContainer.innerHTML = `
                <p class="emptyDay">
                    No items added
                </p>
            `;

            continue;
        }


        itemContainer.innerHTML =
            dayTransactions
                .map(
                    function(transaction) {

                        const amountClass =
                            transaction.amount >= 0
                                ? "positiveAmount"
                                : "negativeAmount";


                        const sign =
                            transaction.amount > 0
                                ? "+"
                                : "";


                        return `
                            <div class="dayItem">

                                <div class="itemInformation">

                                    <strong>
                                        ${protectText(
                                            transaction.description
                                        )}
                                    </strong>

                                    <div class="${amountClass}">
                                        ${sign}${formatMoney(
                                            transaction.amount
                                        )}
                                    </div>

                                </div>


                                <button
                                    class="deleteItem"
                                    type="button"
                                    data-delete-id="${transaction.id}"
                                >
                                    Delete
                                </button>

                            </div>
                        `;

                    }
                )
                .join("");
    }
}


// DRAW GRAPH

function drawGraph() {

    canvas.width =
        canvas.clientWidth;

    canvas.height =
        canvas.clientHeight;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const days =
        getNumberOfDays();


    const monthData =
        calculateMonthBalances(
            currentMonth
        );


    const balances =
        monthData.balances;


    const balancesInDollars =
        balances.map(
            function(balance) {

                return balance / 100;

            }
        );


    const openingBalanceInDollars =
        monthData.openingBalance / 100;


    amountCounter.textContent =
        formatMoney(
            monthData.closingBalance
        );


    // =================================
    // GRAPH AREA
    // =================================

    const graphWidth =
        canvas.width
        - leftSpace
        - rightSpace;


    const graphHeight =
        canvas.height
        - topSpace
        - bottomSpace;


    // =================================
    // MONEY RANGE
    // =================================

    const highestBalance =
        Math.max(
            0,
            openingBalanceInDollars,
            ...balancesInDollars
        );


    const lowestBalance =
        Math.min(
            0,
            openingBalanceInDollars,
            ...balancesInDollars
        );


    let moneyRange =
        highestBalance -
        lowestBalance;


    if (moneyRange === 0) {

        moneyRange = 100;

    }


    const padding =
        Math.max(
            50,
            moneyRange * 0.10
        );


    const maxMoney =
        highestBalance +
        padding;


    const minMoney =
        lowestBalance -
        padding;


    const fullMoneyRange =
        maxMoney -
        minMoney;


    // =================================
    // Y-AXIS MONEY LABELS
    // =================================

    const moneySteps = 5;


    ctx.fillStyle =
        graphColor;

    ctx.font =
        "14px Arial";

    ctx.textAlign =
        "right";

    ctx.textBaseline =
        "middle";


    for (
        let i = 0;
        i <= moneySteps;
        i++
    ) {

        const percentage =
            i / moneySteps;


        const money =
            maxMoney -
            (
                fullMoneyRange *
                percentage
            );


        const y =
            topSpace +
            (
                percentage *
                graphHeight
            );


        ctx.fillText(
            "$" +
            Math.round(money)
                .toLocaleString(),

            leftSpace - 10,

            y
        );
    }


    // =================================
    // X-AXIS DAY LABELS
    // =================================

    ctx.fillStyle =
        graphColor;

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "top";


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const percentage =
            (day - 1) /
            Math.max(
                1,
                days - 1
            );


        const x =
            leftSpace +
            (
                percentage *
                graphWidth
            );


        const y =
            topSpace +
            graphHeight +
            12;


        ctx.fillText(
            day,
            x,
            y
        );
    }


    // =================================
    // ZERO LINE
    // =================================

    const zeroY =
        topSpace +
        (
            (
                maxMoney /
                fullMoneyRange
            ) *
            graphHeight
        );


    ctx.beginPath();

    ctx.moveTo(
        leftSpace,
        zeroY
    );

    ctx.lineTo(
        leftSpace + graphWidth,
        zeroY
    );


    if (
        graphColor ===
        printGraphColor
    ) {

        ctx.strokeStyle =
            "rgba(0, 0, 0, 0.35)";

    } else {

        ctx.strokeStyle =
            "rgba(255, 215, 0, 0.35)";

    }


    ctx.lineWidth =
        1;

    ctx.stroke();


    // =================================
    // BALANCE LINE
    // =================================

    ctx.beginPath();


    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const balance =
            balances[day - 1] / 100;


        const xPercentage =
            (day - 1) /
            Math.max(
                1,
                days - 1
            );


        const x =
            leftSpace +
            (
                xPercentage *
                graphWidth
            );


        const yPercentage =
            (
                maxMoney -
                balance
            ) /
            fullMoneyRange;


        const y =
            topSpace +
            (
                yPercentage *
                graphHeight
            );


        if (day === 1) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );

        }
    }


    ctx.strokeStyle =
        graphColor;

    ctx.lineWidth =
        3;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();


    // =================================
    // DAY PLOT POINTS
    // =================================

    for (
        let day = 1;
        day <= days;
        day++
    ) {

        const balance =
            balances[day - 1] / 100;


        const xPercentage =
            (day - 1) /
            Math.max(
                1,
                days - 1
            );


        const x =
            leftSpace +
            (
                xPercentage *
                graphWidth
            );


        const yPercentage =
            (
                maxMoney -
                balance
            ) /
            fullMoneyRange;


        const y =
            topSpace +
            (
                yPercentage *
                graphHeight
            );


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            4,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            graphColor;

        ctx.fill();
    }
}


// MONTH DISPLAY

function updateMonthDisplay() {

    monthCount.textContent =
        `Month ${currentMonth + 1}`;


    previousMonthButton.disabled =
        currentMonth === 0;


    nextMonthButton.disabled =
        currentMonth ===
        maximumMonths - 1;


    renderDays();

    drawGraph();


    graphScroll.scrollLeft =
        0;
}


// CREATE PRINT REPORT

function createPrintReport() {

    const savedMonth =
        currentMonth;


    const monthsWithData =
        monthlyTransactions
            .map(
                function(
                    transactions,
                    monthIndex
                ) {

                    return {

                        monthIndex:
                            monthIndex,

                        transactions:
                            transactions

                    };

                }
            )
            .filter(
                function(month) {

                    return (
                        month
                            .transactions
                            .length > 0
                    );

                }
            );


    if (
        monthsWithData.length === 0
    ) {

        alert(
            "Add at least one transaction before creating a PDF."
        );

        return false;
    }


    printReport.innerHTML =
        "";


    // Use black when drawing all graphs
    // that will be captured for printing.

    graphColor =
        printGraphColor;


    const finalMonth =
        monthsWithData[
            monthsWithData.length - 1
        ].monthIndex;


    const finalMonthData =
        calculateMonthBalances(
            finalMonth
        );


    const reportTitle =
        document.createElement(
            "section"
        );


    reportTitle.className =
        "printOverview";


    reportTitle.innerHTML = `
        <h1>Cash-Flow Report</h1>

        <div class="printSummary">

            <p>
                <strong>
                    Starting balance:
                </strong>

                ${formatMoney(
                    getStartingBalanceInCents()
                )}
            </p>

            <p>
                <strong>
                    Months included:
                </strong>

                ${monthsWithData.length}
            </p>

            <p>
                <strong>
                    Final balance:
                </strong>

                ${formatMoney(
                    finalMonthData.closingBalance
                )}
            </p>

        </div>
    `;


    printReport.appendChild(
        reportTitle
    );


    for (
        const month
        of monthsWithData
    ) {

        currentMonth =
            month.monthIndex;


        // Draw this month's graph in black.

        drawGraph();


        const graphImage =
            canvas.toDataURL(
                "image/png"
            );


        const monthData =
            calculateMonthBalances(
                month.monthIndex
            );


        const monthSection =
            document.createElement(
                "section"
            );


        monthSection.className =
            "printMonth";


        const transactionRows =
            month.transactions
                .slice()
                .sort(
                    function(first, second) {

                        return (
                            first.day -
                            second.day
                        );

                    }
                )
                .map(
                    function(transaction) {

                        const amountClass =
                            transaction.amount >= 0
                                ? "printIncome"
                                : "printExpense";


                        const sign =
                            transaction.amount > 0
                                ? "+"
                                : "";


                        return `
                            <tr>

                                <td>
                                    Day ${transaction.day}
                                </td>

                                <td>
                                    ${protectText(
                                        transaction.description
                                    )}
                                </td>

                                <td class="${amountClass}">
                                    ${sign}${formatMoney(
                                        transaction.amount
                                    )}
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


        monthSection.innerHTML = `
            <h2>
                Month ${month.monthIndex + 1}
            </h2>

            <div class="printMonthSummary">

                <p>
                    <strong>
                        Opening:
                    </strong>

                    ${formatMoney(
                        monthData.openingBalance
                    )}
                </p>

                <p>
                    <strong>
                        Closing:
                    </strong>

                    ${formatMoney(
                        monthData.closingBalance
                    )}
                </p>

                <p>
                    <strong>
                        Transactions:
                    </strong>

                    ${month.transactions.length}
                </p>

            </div>


            <img
                class="printGraph"
                src="${graphImage}"
                alt="Month ${month.monthIndex + 1} balance graph"
            >


            <table class="printTransactions">

                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
                    ${transactionRows}
                </tbody>

            </table>
        `;


        printReport.appendChild(
            monthSection
        );
    }


    // Restore normal screen settings.

    currentMonth =
        savedMonth;

    graphColor =
        screenGraphColor;

    updateMonthDisplay();


    return true;
}


// CHANGE NUMBER OF DAYS MANUALLY

daysInput.addEventListener(
    "change",
    function() {

        const numberOfDays =
            getNumberOfDays();


        daysInput.value =
            numberOfDays;


        renderDays();

        drawGraph();
    }
);


// CHANGE STARTING MONEY

startingMoneyInput.addEventListener(
    "input",
    function() {

        drawGraph();

    }
);


// ADD DAY

addDayButton.addEventListener(
    "click",
    function() {

        let days =
            getNumberOfDays();


        if (days < 31) {

            days++;

            daysInput.value =
                days;


            renderDays();

            drawGraph();
        }
    }
);


// REMOVE DAY

removeDayButton.addEventListener(
    "click",
    function() {

        let days =
            getNumberOfDays();


        if (days > 7) {

            days--;

            daysInput.value =
                days;


            renderDays();

            drawGraph();
        }
    }
);


// ADD TRANSACTION

dayCards.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const form =
            event.target.closest(
                ".dayForm"
            );


        if (!form) {

            return;

        }


        const day =
            Number(
                form.dataset.day
            );


        const descriptionInput =
            form.querySelector(
                ".itemDescription"
            );


        const amountInput =
            form.querySelector(
                ".itemAmount"
            );


        const description =
            descriptionInput
                .value
                .trim();


        const enteredAmount =
            Number(
                amountInput.value
            );


        if (
            description === "" ||
            !Number.isFinite(
                enteredAmount
            )
        ) {

            return;

        }


        const amountInCents =
            Math.round(
                enteredAmount * 100
            );


        getCurrentTransactions().push({

            id:
                Date.now() +
                Math.random(),

            day:
                day,

            description:
                description,

            amount:
                amountInCents

        });


        form.reset();


        renderDays();

        drawGraph();
    }
);


// DELETE TRANSACTION

dayCards.addEventListener(
    "click",
    function(event) {

        const deleteButton =
            event.target.closest(
                "[data-delete-id]"
            );


        if (!deleteButton) {

            return;

        }


        const transactionId =
            Number(
                deleteButton
                    .dataset
                    .deleteId
            );


        monthlyTransactions[currentMonth] =
            getCurrentTransactions().filter(
                function(transaction) {

                    return (
                        transaction.id !==
                        transactionId
                    );

                }
            );


        renderDays();

        drawGraph();
    }
);


// NEXT MONTH

nextMonthButton.addEventListener(
    "click",
    function() {

        if (
            currentMonth >=
            maximumMonths - 1
        ) {

            return;

        }


        currentMonth++;


        if (
            !monthlyTransactions[currentMonth]
        ) {

            monthlyTransactions.push([]);

        }


        updateMonthDisplay();
    }
);


// PREVIOUS MONTH

previousMonthButton.addEventListener(
    "click",
    function() {

        if (currentMonth === 0) {

            return;

        }


        currentMonth--;


        updateMonthDisplay();
    }
);

// SAVE / PRINT PDF
saveButton.addEventListener(
    "click",
    function() {

        const reportCreated =
            createPrintReport();


        if (!reportCreated) {

            return;

        }


        requestAnimationFrame(
            function() {

                window.print();

            }
        );
    }
);

// WINDOW RESIZE
window.addEventListener(
    "resize",
    drawGraph
);

// INITIAL PAGE LOAD
updateMonthDisplay();

//save as pdf
document.getElementById("saveAs").addEventListener("click", () => window.print());