// script.js
document.addEventListener("DOMContentLoaded", () => {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const fromFlag = document.getElementById("from-flag");
    const toFlag = document.getElementById("to-flag");
    const convertBtn = document.getElementById("convert-btn");
    const conversionResult = document.getElementById("conversion-result");
    const amountInput = document.getElementById("amount");

    // Fetch country and currency data
    fetch("https://restcountries.com/v3.1/all")
        .then(response => response.json())
        .then(data => {
            const currencyOptions = [];
            const seenCurrencies = new Set();

            data.forEach(country => {
                if (country.currencies && country.flags) {
                    const currencyCode = Object.keys(country.currencies)[0];
                    const currencyName = country.currencies[currencyCode]?.name;
                    const flagUrl = country.flags.svg;

                    if (!seenCurrencies.has(currencyCode)) {
                        seenCurrencies.add(currencyCode);
                        currencyOptions.push({
                            code: currencyCode,
                            name: currencyName,
                            flag: flagUrl
                        });
                    }
                }
            });

            populateDropdown(fromSelect, currencyOptions);
            populateDropdown(toSelect, currencyOptions);

            fromSelect.value = "INR";
            toSelect.value = "USD";

            updateFlag(fromSelect, fromFlag);
            updateFlag(toSelect, toFlag);

            fromSelect.addEventListener("change", () => updateFlag(fromSelect, fromFlag));
            toSelect.addEventListener("change", () => updateFlag(toSelect, toFlag));
        })
        .catch(error => {
            console.error("Error fetching country data:", error);
        });

    convertBtn.addEventListener("click", () => {
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            conversionResult.textContent = "Please enter a valid amount.";
            conversionResult.classList.replace("alert-info", "alert-danger");
            return;
        }

        if (fromCurrency === toCurrency) {
            conversionResult.textContent = "Please select different currencies for conversion.";
            conversionResult.classList.replace("alert-info", "alert-danger");
            return;
        }

        fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[toCurrency];
                if (rate) {
                    const convertedAmount = (amount * rate).toFixed(2);
                    conversionResult.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
                    conversionResult.classList.replace("alert-danger", "alert-info");
                } else {
                    conversionResult.textContent = "Exchange rate not available.";
                    conversionResult.classList.replace("alert-info", "alert-danger");
                }
            })
            .catch(error => {
                console.error("Error fetching exchange rate data:", error);
                conversionResult.textContent = "Error fetching exchange rate.";
                conversionResult.classList.replace("alert-info", "alert-danger");
            });
    });

    function populateDropdown(selectElement, options) {
        selectElement.innerHTML = "";
        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option.code;
            optionElement.textContent = `${option.name} (${option.code})`;
            optionElement.setAttribute("data-flag", option.flag);
            selectElement.appendChild(optionElement);
        });
    }

    function updateFlag(selectElement, flagImage) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption) {
            flagImage.src = selectedOption.getAttribute("data-flag");
        }
    }
});
