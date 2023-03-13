var inputedMoney = 0;

const purchase_button_id = '#purchase-button';
const return_change_id = '#return-change';
const item_to_vend_id = '#item-to-vend';
const vending_message_id = '#vending-message';
const money_input_id = '#money-input';

$(document).ready(function () {

    loadVendingItems();

    $('#add-dollar-button').on('click', function () {
        inputedMoney += 1;
        messageBox("You added a Dollar");
        updateMoneyBox(inputedMoney);
    });

    $('#add-50c-button').on('click', function () {
        inputedMoney += .50;
        messageBox("You added a 50 cents")
        updateMoneyBox(inputedMoney);
    });

    $('#add-25c-button').on('click', function () {
        inputedMoney += .25;
        messageBox("You added a 25 cents");
        updateMoneyBox(inputedMoney);
    });

    $('#add-10c-button').on('click', function () {
        inputedMoney += .10;
        messageBox("You added 10 cents")
        updateMoneyBox(inputedMoney);
    });

    $(purchase_button_id).click(function () {
        makePurchase();
    });

    $(return_change_id).on('click', function () {
        returnChange();
    });

    $('#adminUpdate').on('click', function () {
        $.ajax({
            type: 'POST',
            url: 'http://localhost:4001/adminUpdate/',
            success: function (data) {
                loadVendingItems();
            }
        });

    })
})


function loadVendingItems() {
    var vendingDiv = $('#vending-items');
    var display_item_quantity_div = $('#display_item_quantity');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:4001/status',
        success: function (vendingItemsArray) {
            vendingDiv.empty();
            display_item_quantity_div.empty();

            $.each(vendingItemsArray, function (index, item) {
                var name = item.name;
                var displayName = item.displayName || item.name;
                var price = item.price;
                var quantity = item.quantity;

                var vendingInfo = '<div class="vending-items col-sm-4" title="' + item.description + '" onclick="selectedItem(\'' + name + '\')" role="button" id="item-' + name + '" style="text-align: center; margin-bottom: 30px; margin-top 30px">';
                vendingInfo += '<p><b>' + displayName + '</b></p>';
                vendingInfo += '<p>$' + price + '</p>';
                vendingInfo += '<p> Quantity Left: ' + quantity + '</p>';
                vendingInfo += '</div>';
                vendingDiv.append(vendingInfo);

                $('#item-' + name).tooltip({show: {effect: "blind", delay: 0}});
            });
        },
        error: function () {
            alert("Failure Calling The Web Service. Please try again later.");
        }
    });
}

function selectedItem(name) {
    $(item_to_vend_id).val(name);
}


function messageBox(message) {
    $(vending_message_id).val(message);
}


function updateMoneyBox(money) {
    if (money > 0) {
        $(purchase_button_id).removeAttr('disabled');
        $(return_change_id).removeAttr('disabled');
    } else {
        $(purchase_button_id).attr("disabled", "disabled");
        $(return_change_id).attr("disabled", "disabled");
    }
    $(money_input_id).val(money.toFixed(2));
}

const change_input_box_id = '#change-input-box';

function makePurchase() {
    var money = +$(money_input_id).val();
    var item = $(item_to_vend_id).val();

    if (!item){
        alert("Please select an item!");
        return;
    }

    if (money === 0) {
        alert("Please enter money first!");
        return;
    }
    $.ajax({
        type: 'POST',
        url: 'http://localhost:4001/purchase/',
        data: {"name": item, "quantity": +1, money: +$(money_input_id).val()},
        complete: function (moneyToBeReturned) {
            moneyToBeReturned = moneyToBeReturned.responseJSON.data;
            if (moneyToBeReturned === -1) {
                alert("Not enough money!");
            } else if (moneyToBeReturned === -2) {
                alert("Not enough quantity!");
            } else {
                var change = $(change_input_box_id);
                $(vending_message_id).val("Item vended. Thank you!");

                var returnMoney = moneyToBeReturned;

                var dollar = Math.floor(moneyToBeReturned / 1.00);
                moneyToBeReturned = (moneyToBeReturned - dollar).toFixed(2);
                var cent_50 = Math.floor(moneyToBeReturned / 0.50);
                moneyToBeReturned = (moneyToBeReturned - cent_50 * 0.50).toFixed(2);
                var cent_25 = Math.floor(moneyToBeReturned / 0.25);
                moneyToBeReturned = (moneyToBeReturned - cent_25 * 0.25).toFixed(2);
                var cent_10 = Math.floor(moneyToBeReturned / 0.10);
                moneyToBeReturned = (moneyToBeReturned - cent_10 * 0.10).toFixed(2);

                var returnMessage = "";
                if (dollar !== 0) {
                    returnMessage += dollar + ' Dollar/s ';
                }
                if (cent_50 !== 0) {
                    returnMessage += cent_50 + ' 50 Cents/s ';
                }
                if (cent_25 !== 0) {
                    returnMessage += cent_25 + ' 25 Cents/s ';
                }
                if (cent_10 !== 0) {
                    returnMessage += cent_10 + ' 10 Cent/s ';
                }

                if (+$(money_input_id).val() === 0) {
                    alert("Please enter money first!");
                } else {
                    if (dollar === 0 && cent_50 === 0 && cent_25 === 0 && cent_10 === 0) {
                        returnMessage += "There is no change.";
                    } else {
                        messageBox("Please collect your item and the change.");
                    }
                }

                downloadObjectAsJson({
                    "Purchased Item": item,
                    "Money Entered ($)": money,
                    "Change": {
                        "Total Amount ($)": parseFloat(returnMoney.toFixed(2)),
                        "Dollar coins": dollar || 0,
                        "50 Cent Coins": cent_50 || 0,
                        "25 Cent Coins": cent_25 || 0,
                        "10 Cent Coins": cent_10 || 0
                    }
                }, 'purchase');

                change.val(returnMessage);
                updateMoneyBox(0);
                inputedMoney = 0;
            }
            loadVendingItems();
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            alert(err.Message);
        }
    });
}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


function returnChange() {
    var inputMoney = $(money_input_id).val();
    var moneyToBeReturned = $(money_input_id).val();

    var dollar = Math.floor(moneyToBeReturned / 1.00);
    moneyToBeReturned = (moneyToBeReturned - dollar).toFixed(2);
    var cent_50 = Math.floor(moneyToBeReturned / 0.50);
    moneyToBeReturned = (moneyToBeReturned - cent_50 * 0.50).toFixed(2);
    var cent_25 = Math.floor(moneyToBeReturned / 0.25);
    moneyToBeReturned = (moneyToBeReturned - cent_25 * 0.25).toFixed(2);
    var cent_10 = Math.floor(moneyToBeReturned / 0.10);
    moneyToBeReturned = (moneyToBeReturned - cent_10 * 0.10).toFixed(2);

    var returnMessage = "";
    var vendingMessage = "";

    if (dollar !== 0) {
        returnMessage += dollar + ' Dollar/s ';
    }
    if (cent_50 !== 0) {
        returnMessage += cent_50 + ' 50 Cents/s ';
    }
    if (cent_25 !== 0) {
        returnMessage += cent_25 + ' 25 Cents/s ';
    }
    if (cent_10 !== 0) {
        returnMessage += cent_10 + ' 10 Cent/s ';
    }
    if (dollar === 0 && cent_50 === 0 && cent_25 === 0 && cent_10 === 0) {
        returnMessage += "There is no change.";
        vendingMessage = "No money was inputted.";
    } else {
        vendingMessage = "Transaction cancelled. Money inputted ($" + inputMoney + ") is returned through change.";
    }

    inputedMoney = 0;
    messageBox("");
    $(vending_message_id).val(vendingMessage);
    $(change_input_box_id).val(returnMessage);
    $(item_to_vend_id).val('');
    updateMoneyBox(0)
}
