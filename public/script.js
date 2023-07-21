//Follow this doc for HTML and REST API integration: https://hyperswitch.io/docs/sdkIntegrations/unifiedCheckoutWeb/restAPIBackendAndHTMLFrontend
// Update your publishable key here

const hyper = Hyper("HYPERSWITCH_PUBLISHABLE_KEY");

const items = [{ id: "xl-tshirt" }];

async function initialize() {
  const { client_secret } = await fetch("/create.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).then((r) => r.json());

  // You can change the apperance of the SDK by adding field here
  const appearance = {
    // theme: "midnight",
  };

  widgets = hyper.widgets({
    appearance,
    clientSecret: client_secret
  });

  const unifiedCheckoutOptions = {
    layout: "tabs",
    wallets: {
      walletReturnUrl: "https://example.com/complete",
      //Mandatory parameter for Wallet Flows such as Googlepay, Paypal and Applepay
    },
  };

  const unifiedCheckout = widgets.create("payment", unifiedCheckoutOptions);
  unifiedCheckout.mount("#unified-checkout");
}
initialize();

async function handleSubmit(e) {
  setLoading(true);
  const { error, data, status } = await hyper.confirmPayment({
    widgets,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "https://example.com/complete",
    },
  });

  // This point will only be reached if there is an immediate error occurring while confirming the payment. Otherwise, your customer will be redirected to your `return_url`.

  // For some payment flows such as Sofort, iDEAL, your customer will be redirected to an intermediate page to complete authorization of the payment, and then redirected to the `return_url`.

  if (error && error.type === "validation_error") {
    showMessage(error.message);
  }
  else if (status === "succeeded") {
    addClass("#hypers-sdk", "hidden")
    removeClass("#orderSuccess", "hidden")
  }
  else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// Fetches the payment status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { payment } = await hyper.retrievePayment(clientSecret);

  switch (payment.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

function setLoading(showLoader) {
  if (showLoader) {
    show('.spinner');
    hide('#button-text');
  }
  else {
    hide('.spinner');
    show('#button-text');
  }
}

function show(id) {
  removeClass(id, 'hidden');
}
function hide(id) {
  addClass(id, 'hidden');
}

function showMessage(msg) {
  show('#payment-message');
  addText('#payment-message', msg);
}

function addText(id, msg) {
  var element = document.querySelector(id);
  element.innerText = msg;
}

function addClass(id, className) {
  var element = document.querySelector(id);
  element.classList.add(className);
}

function removeClass(id, className) {
  var element = document.querySelector(id);
  element.classList.remove(className);
}

function retryPayment() {
  hide('#orderSuccess');
  show('.Container');
  initialize();
}

function showSDK(e) {
  hide('.Container');
  show('#hypers-sdk');
};
