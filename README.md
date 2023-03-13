# ColaCo-vending-machine

This repository contains the code for the webpage of a virtual vending machine ColaCo.

Steps to Run-

a) Download the code and use "npm start" from the source folder. 
b) The webpage will be hosted on "localhost:4001" in the browser.

Functionalities-

a) User can select any drink (item) from the listed options, input money and then make a purchase. The browser downloads a JSON file after the purchase.

b) The admin can get current status, restock, add a new drink and update price through http APIs listed below. After any of these APIs being hit, the "Admin Update" button on the UI needs to be clicked to bring the UI to its updated state.


Backend APIs-

a) GET "/status"- Gets the current state of the vending machine including details about the all the available drinks.

b) POST "/add-drink"- Adds a new drink to the vending machine

c) POST "/restock"- Restocks any drink to the vending machine

d) POST "/update-price"- Updates the price of any drink in the vending machine

These APIs can be hit using postman with header- Content-type, application/json. The request body for all these APIs are in the repository as JSON files.
