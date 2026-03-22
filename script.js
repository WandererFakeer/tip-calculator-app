import CURRENCY_SYMBOL from "./currencyData.js";

// DOM references
const form = document.querySelector("#form");
const customTipOption = document.querySelector(".custom-tip-option");
const customInputWrapper = document.querySelector("#custom-input-wrapper");
const wrongInputAlert = document.querySelector("#wrong-input-alert");
const headsInput = document.querySelector("#heads-input");
const tipPerPerson = document.querySelector("#tip-per-person");
const totalPerPerson = document.querySelector("#total-per-person");
const button = document.querySelector("#button");

const FETCH_URL = "https://api.techniknews.net/ipgeo/";

const state = {
  currencySymbol: "",
  billAmount: 0,
  tipPercent: 0,
  tipPercentCustom: false,
  people: 0,
  peopleErrorData: "",
  tipPerPerson: "0.00",
  totalPerPerson: "0.00",
};

// Function to get the local currency
async function getCurrency(){
  const response = await fetch(FETCH_URL);
  return await response.json();
}

// Function to set the local currency
async function setCurrency(){
  const data = await getCurrency();
  const currency = data?.currency;
  state.currencySymbol = CURRENCY_SYMBOL[currency];
}

// Render 
function render() {
  customTipOption.hidden = state.tipPercentCustom;
  customInputWrapper.hidden = !state.tipPercentCustom;

  wrongInputAlert.textContent = state.peopleErrorData;
  headsInput.classList.toggle("invalid-input", state.peopleErrorData);

  tipPerPerson.textContent = `${state.currencySymbol}${state.tipPerPerson}`;
  totalPerPerson.textContent = `${state.currencySymbol}${state.totalPerPerson}`;

  button.disabled = !state.billAmount || !state.tipPercent || !state.people;
}

// Function to get all user entered data
function getFormData() {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  return data;
}

// Function to calculate amount
function calculateAmount(bill, tip, people) {
  return (bill * tip) / 100 / people;
}

// Function to calculate bill splitter
function calculateBillSplitter() {
  state.tipPerPerson = state.people ? calculateAmount(state.billAmount, state.tipPercent, state.people).toFixed(2) : "0.00";

  state.totalPerPerson = state.people ? calculateAmount(state.billAmount, state.tipPercent + 100, state.people).toFixed(2) : "0.00";

  render();
}

// Function to handle calculation
function handleFormData() {
  const data = getFormData();

  state.billAmount = Number(data?.bill) || 0;

  if (data?.["tip-percent"] && data?.["tip-percent"] !== "custom") {
    state.tipPercent = Number(data?.["tip-percent"]?.replace("%", "")) || 0;
  }

  if (data?.["custom-tip"]) {
    state.tipPercent = Number(data?.["custom-tip"]);
  }

  state.tipPercentCustom = data?.["tip-percent"] === "custom";

  state.people = Number(data?.heads) || 0;

  if (data?.heads !== "" && state.people <= 0) {
    state.peopleErrorData = "Can't be zero";
  } 
  
  else {
    state.peopleErrorData = "";
  }

  calculateBillSplitter();
}

// Function to reset all data
function handleReset(){
  form.reset();

  state.billAmount = 0;
  state.tipPercent = 0;
  state.tipPercentCustom = false;
  state.people = 0;
  state.peopleErrorData = "";
  state.tipPerPerson = "0.00";
  state.totalPerPerson = "0.00";

  render();
}

async function init(){
  await setCurrency();
  render();
}

init();

// Event listener
form.addEventListener("input", handleFormData);
form.addEventListener("change", handleFormData);
button.addEventListener("click", handleReset);
