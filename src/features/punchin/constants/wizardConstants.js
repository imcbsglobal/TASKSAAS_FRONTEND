// Wizard step constants
export const WIZARD_STEPS = Object.freeze({
  CUSTOMER_SELECTION: 1,
  PHOTO_CAPTURE: 2,
  LOCATION_CAPTURE: 3,
  CONFIRMATION: 4
});

export const STEP_TITLES = Object.freeze({
  [WIZARD_STEPS.CUSTOMER_SELECTION]: "Select Customer",
  [WIZARD_STEPS.PHOTO_CAPTURE]: "Take Photo",
  [WIZARD_STEPS.LOCATION_CAPTURE]: "Capture Location",
  [WIZARD_STEPS.CONFIRMATION]: "Confirm Punch In"
});

export const ANIMATION_VARIANTS = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export const DEBOUNCE_DELAY = 300;
